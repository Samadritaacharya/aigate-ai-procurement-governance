from __future__ import annotations

import json
import sqlite3
import uuid
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .models import ScreeningResult, UseCase


class RegistryStore:
    """Small local SQLite registry for community/self-hosted mode.

    The public Vercel demo intentionally uses browser-local history because
    serverless filesystems are not durable. The Python service can persist
    screened use cases locally with no external database dependency.
    """

    def __init__(self, path: str | Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._init()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init(self) -> None:
        with self._connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS screenings (
                    id TEXT PRIMARY KEY,
                    created_at TEXT NOT NULL,
                    name TEXT NOT NULL,
                    risk_band TEXT NOT NULL,
                    decision TEXT NOT NULL,
                    readiness_score INTEGER NOT NULL,
                    input_json TEXT NOT NULL,
                    result_json TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS audit_events (
                    seq INTEGER PRIMARY KEY AUTOINCREMENT,
                    screening_id TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    event_json TEXT NOT NULL
                );
                """
            )

    def save(self, uc: UseCase, result: ScreeningResult) -> str:
        screening_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        input_json = json.dumps(asdict(uc), ensure_ascii=False, separators=(',', ':'))
        result_json = json.dumps(result.to_dict(), ensure_ascii=False, separators=(',', ':'))
        audit = json.dumps(
            {
                'risk_band': result.risk_band,
                'decision': result.decision,
                'policy_version': result.policy_version,
                'readiness_score': result.readiness_score,
            },
            separators=(',', ':'),
        )
        with self._connect() as conn:
            conn.execute(
                'INSERT INTO screenings VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                (
                    screening_id,
                    created_at,
                    uc.name,
                    result.risk_band,
                    result.decision,
                    result.readiness_score,
                    input_json,
                    result_json,
                ),
            )
            conn.execute(
                'INSERT INTO audit_events (screening_id, created_at, event_type, event_json) VALUES (?, ?, ?, ?)',
                (screening_id, created_at, 'SCREENED', audit),
            )
        return screening_id

    def list(self, limit: int = 50) -> list[dict[str, Any]]:
        limit = max(1, min(int(limit), 100))
        with self._connect() as conn:
            rows = conn.execute(
                'SELECT id, created_at, name, risk_band, decision, readiness_score FROM screenings ORDER BY created_at DESC LIMIT ?',
                (limit,),
            ).fetchall()
        return [dict(row) for row in rows]

    def get(self, screening_id: str) -> dict[str, Any] | None:
        with self._connect() as conn:
            row = conn.execute('SELECT * FROM screenings WHERE id = ?', (screening_id,)).fetchone()
            if row is None:
                return None
            events = conn.execute(
                'SELECT seq, created_at, event_type, event_json FROM audit_events WHERE screening_id = ? ORDER BY seq',
                (screening_id,),
            ).fetchall()
        return {
            'id': row['id'],
            'created_at': row['created_at'],
            'name': row['name'],
            'risk_band': row['risk_band'],
            'decision': row['decision'],
            'readiness_score': row['readiness_score'],
            'input': json.loads(row['input_json']),
            'result': json.loads(row['result_json']),
            'audit_events': [
                {
                    'seq': e['seq'],
                    'created_at': e['created_at'],
                    'event_type': e['event_type'],
                    'event': json.loads(e['event_json']),
                }
                for e in events
            ],
        }
