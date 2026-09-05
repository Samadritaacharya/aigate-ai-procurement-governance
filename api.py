from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query, Request

from src.aigate.engine import evaluate_use_case
from src.aigate.registry import RegistryStore
from src.aigate.validation import validate_payload

app = FastAPI(title='AIGate API', version='1.0.0')
MAX_BODY_BYTES = 32_000


def _registry() -> RegistryStore:
    return RegistryStore(Path(os.getenv('AIGATE_DB_PATH', 'data/aigate_registry.db')))


async def _read_use_case(request: Request):
    raw = await request.body()
    if len(raw) > MAX_BODY_BYTES:
        raise HTTPException(status_code=413, detail='request too large')
    try:
        payload = json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise HTTPException(status_code=400, detail='valid JSON object required') from exc
    try:
        return validate_payload(payload)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get('/health')
def health() -> dict[str, Any]:
    return {
        'status': 'ok',
        'service': 'aigate',
        'paid_api_required': False,
        'policy': 'deterministic-2026.09',
        'registry': 'sqlite-local',
    }


@app.post('/v1/screen')
async def screen(request: Request) -> dict[str, Any]:
    uc = await _read_use_case(request)
    return evaluate_use_case(uc).to_dict()


@app.post('/v1/registry', status_code=201)
async def register(request: Request) -> dict[str, Any]:
    uc = await _read_use_case(request)
    result = evaluate_use_case(uc)
    screening_id = _registry().save(uc, result)
    return {'id': screening_id, 'screening': result.to_dict()}


@app.get('/v1/registry')
def list_registry(limit: int = Query(default=50, ge=1, le=100)) -> dict[str, Any]:
    items = _registry().list(limit=limit)
    return {'items': items, 'count': len(items)}


@app.get('/v1/registry/{screening_id}')
def get_registry_entry(screening_id: str) -> dict[str, Any]:
    item = _registry().get(screening_id)
    if item is None:
        raise HTTPException(status_code=404, detail='screening not found')
    return item
