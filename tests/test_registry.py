from __future__ import annotations

from src.aigate.engine import evaluate_use_case
from src.aigate.models import UseCase
from src.aigate.registry import RegistryStore


def test_registry_round_trip(tmp_path):
    store = RegistryStore(tmp_path / 'registry.db')
    uc = UseCase(name='Knowledge assistant', purpose='Answer approved internal policy questions for employees.')
    result = evaluate_use_case(uc)
    sid = store.save(uc, result)
    rows = store.list()
    assert len(rows) == 1
    assert rows[0]['id'] == sid
    item = store.get(sid)
    assert item is not None
    assert item['input']['name'] == 'Knowledge assistant'
    assert item['result']['decision'] == 'STANDARD_REVIEW'
    assert item['audit_events'][0]['event_type'] == 'SCREENED'


def test_registry_missing_returns_none(tmp_path):
    store = RegistryStore(tmp_path / 'registry.db')
    assert store.get('missing') is None


def test_registry_limit_is_bounded(tmp_path):
    store = RegistryStore(tmp_path / 'registry.db')
    uc = UseCase(name='Knowledge assistant', purpose='Answer approved internal policy questions for employees.')
    result = evaluate_use_case(uc)
    for _ in range(3):
        store.save(uc, result)
    assert len(store.list(limit=2)) == 2
