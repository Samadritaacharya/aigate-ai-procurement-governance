from __future__ import annotations

import json
from pathlib import Path

from .engine import evaluate_use_case
from .models import UseCase


def load_cases(path: str | Path) -> list[dict]:
    return json.loads(Path(path).read_text(encoding='utf-8'))


def evaluate_cases(path: str | Path) -> dict:
    cases = load_cases(path)
    correct_band = 0
    correct_decision = 0
    details = []
    for case in cases:
        uc = UseCase(**case['input'])
        result = evaluate_use_case(uc)
        band_ok = result.risk_band == case['expected']['risk_band']
        decision_ok = result.decision == case['expected']['decision']
        correct_band += int(band_ok)
        correct_decision += int(decision_ok)
        details.append({'id': case['id'], 'band_ok': band_ok, 'decision_ok': decision_ok})
    total = len(cases)
    return {
        'cases': total,
        'risk_band_accuracy': correct_band / total if total else 0.0,
        'decision_accuracy': correct_decision / total if total else 0.0,
        'details': details,
    }
