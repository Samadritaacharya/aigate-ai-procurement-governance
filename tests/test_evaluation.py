from pathlib import Path
import hashlib
import json

from src.aigate.evaluator import evaluate_cases
from src.aigate.engine import evaluate_use_case
from src.aigate.models import UseCase

SNAPSHOT_KEYS = [
    'risk_band','decision','approval_route','evidence_score','vendor_score',
    'readiness_score','annual_benefit_eur','annual_net_value_eur','roi_pct',
    'payback_months','missing_controls',
]


def _normalise(value):
    if isinstance(value, dict):
        return {k: _normalise(value[k]) for k in sorted(value)}
    if isinstance(value, list):
        return [_normalise(x) for x in value]
    if isinstance(value, float) and value.is_integer():
        return int(value)
    return value


def _hash(value: dict) -> str:
    payload = json.dumps(_normalise(value), sort_keys=True, separators=(',', ':'), ensure_ascii=False)
    return hashlib.sha256(payload.encode()).hexdigest()


def test_32_case_evaluation_is_exact():
    r = evaluate_cases(Path('data/evaluation_cases.json'))
    assert r['cases'] == 32
    assert r['risk_band_accuracy'] == 1.0
    assert r['decision_accuracy'] == 1.0
    assert all(x['band_ok'] and x['decision_ok'] for x in r['details'])


def test_frontend_fixture_parity():
    left = json.loads(Path('data/evaluation_cases.json').read_text())
    right = json.loads(Path('frontend/lib/evaluation_cases.json').read_text())
    assert left == right


def test_python_output_hashes_are_stable():
    cases = json.loads(Path('data/evaluation_cases.json').read_text())
    expected = {x['id']: x['sha256'] for x in json.loads(Path('data/evaluation_hashes.json').read_text())}
    for case in cases:
        result = evaluate_use_case(UseCase(**case['input'])).to_dict()
        subset = {k: result[k] for k in SNAPSHOT_KEYS}
        assert _hash(subset) == expected[case['id']]


def test_frontend_hash_fixture_parity():
    left = json.loads(Path('data/evaluation_hashes.json').read_text())
    right = json.loads(Path('frontend/lib/evaluation_hashes.json').read_text())
    assert left == right
