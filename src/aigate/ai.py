from __future__ import annotations

import json
import os
import urllib.request
from dataclasses import asdict

from .models import ScreeningResult, UseCase


def deterministic_summary(uc: UseCase, result: ScreeningResult) -> str:
    missing = ', '.join(result.missing_controls[:4]) if result.missing_controls else 'no critical evidence gaps detected'
    return (
        f"{uc.name} screened as {result.risk_band}. The deterministic policy routes it to "
        f"{result.decision}; readiness is {result.readiness_score}/100. Priority evidence work: {missing}. "
        "Any model-generated explanation is advisory only and cannot change this policy decision."
    )


def optional_local_model_summary(uc: UseCase, result: ScreeningResult) -> str:
    """Optional OpenAI-compatible local endpoint. No endpoint is required for the app."""
    base = os.getenv('AIGATE_LLM_BASE_URL', '').strip().rstrip('/')
    model = os.getenv('AIGATE_LLM_MODEL', '').strip()
    if not base or not model:
        return deterministic_summary(uc, result)

    body = {
        'model': model,
        'messages': [
            {
                'role': 'system',
                'content': 'Explain this AI procurement/governance screening in concise enterprise language. Do not alter the deterministic decision.'
            },
            {
                'role': 'user',
                'content': json.dumps({'use_case': asdict(uc), 'screening': result.to_dict()}, default=str)
            },
        ],
        'temperature': 0.2,
    }
    req = urllib.request.Request(
        f'{base}/chat/completions',
        data=json.dumps(body).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=6) as response:
            data = json.loads(response.read().decode('utf-8'))
            text = str(data['choices'][0]['message']['content']).strip()
            return text or deterministic_summary(uc, result)
    except Exception:
        return deterministic_summary(uc, result)
