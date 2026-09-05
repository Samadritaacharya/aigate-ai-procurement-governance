from __future__ import annotations

import math
from dataclasses import fields
from typing import Any

from .models import UseCase

STRING_FIELDS = {'name', 'purpose', 'business_unit', 'role', 'vendor', 'model', 'domain', 'users'}
NUMERIC_FIELDS = {'annual_volume', 'hours_saved_per_case', 'value_per_hour_eur', 'implementation_cost_eur', 'annual_run_cost_eur'}
BOOLEAN_FIELDS = {f.name for f in fields(UseCase)} - STRING_FIELDS - NUMERIC_FIELDS
ALLOWED_FIELDS = STRING_FIELDS | NUMERIC_FIELDS | BOOLEAN_FIELDS

LIMITS: dict[str, tuple[float, float]] = {
    'annual_volume': (0, 10_000_000),
    'hours_saved_per_case': (0, 24),
    'value_per_hour_eur': (0, 10_000),
    'implementation_cost_eur': (0, 100_000_000),
    'annual_run_cost_eur': (0, 100_000_000),
}


def validate_payload(payload: Any) -> UseCase:
    if not isinstance(payload, dict):
        raise ValueError('JSON object required')
    unknown = sorted(set(payload) - ALLOWED_FIELDS)
    if unknown:
        raise ValueError(f"Unknown fields: {', '.join(unknown)}")

    for key in STRING_FIELDS:
        if key in payload and not isinstance(payload[key], str):
            raise ValueError(f'{key} must be a string')
    name = str(payload.get('name', '')).strip()
    purpose = str(payload.get('purpose', '')).strip()
    if not name:
        raise ValueError('name is required')
    if len(name) > 200:
        raise ValueError('name must be 200 characters or fewer')
    if len(purpose) < 20:
        raise ValueError('purpose must be at least 20 characters')
    if len(purpose) > 5000:
        raise ValueError('purpose must be 5000 characters or fewer')

    for key in BOOLEAN_FIELDS:
        if key in payload and not isinstance(payload[key], bool):
            raise ValueError(f'{key} must be a boolean')

    for key in NUMERIC_FIELDS:
        if key not in payload:
            continue
        value = payload[key]
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(float(value)):
            raise ValueError(f'{key} must be a finite number')
        low, high = LIMITS[key]
        if not low <= float(value) <= high:
            raise ValueError(f'{key} must be between {low:g} and {high:g}')
        if key == 'annual_volume' and int(value) != value:
            raise ValueError('annual_volume must be a whole number')

    normalized = dict(payload)
    normalized['name'] = name
    normalized['purpose'] = purpose
    return UseCase(**normalized)
