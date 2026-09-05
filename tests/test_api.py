from fastapi.testclient import TestClient

from api import app

client = TestClient(app)


def valid_payload(**extra):
    body = {'name': 'Support copilot', 'purpose': 'Assist support agents with approved knowledge and human review.'}
    body.update(extra)
    return body


def test_health():
    r = client.get('/health')
    assert r.status_code == 200
    assert r.json()['paid_api_required'] is False


def test_screen_minimal():
    r = client.post('/v1/screen', json=valid_payload())
    assert r.status_code == 200
    assert r.json()['risk_band'] == 'minimal'


def test_screen_high_risk():
    r = client.post('/v1/screen', json=valid_payload(employment_decisions=True, personal_data=True))
    assert r.status_code == 200
    assert r.json()['decision'] == 'HUMAN_APPROVAL_REQUIRED'


def test_missing_name_rejected():
    r = client.post('/v1/screen', json={'purpose': 'A sufficiently detailed purpose for the endpoint test.'})
    assert r.status_code == 422


def test_short_purpose_rejected():
    r = client.post('/v1/screen', json={'name': 'x', 'purpose': 'short'})
    assert r.status_code == 422


def test_unknown_field_rejected():
    r = client.post('/v1/screen', json=valid_payload(secret_admin_override=True))
    assert r.status_code == 422


def test_primitive_json_rejected():
    r = client.post('/v1/screen', json='hello')
    assert r.status_code == 422


def test_malformed_json_rejected_without_crash():
    r = client.post('/v1/screen', content='{broken', headers={'Content-Type': 'application/json'})
    assert r.status_code == 400


def test_boolean_type_mismatch_rejected():
    r = client.post('/v1/screen', json=valid_payload(employment_decisions='false'))
    assert r.status_code == 422


def test_non_finite_or_out_of_range_number_rejected():
    r = client.post('/v1/screen', json=valid_payload(hours_saved_per_case=99))
    assert r.status_code == 422


def test_fractional_annual_volume_rejected():
    r = client.post('/v1/screen', json=valid_payload(annual_volume=10.5))
    assert r.status_code == 422


def test_oversized_body_rejected():
    payload = '{"name":"x","purpose":"' + ('a' * 40000) + '"}'
    r = client.post('/v1/screen', content=payload, headers={'Content-Type':'application/json'})
    assert r.status_code == 413


def test_registry_api_round_trip(tmp_path, monkeypatch):
    monkeypatch.setenv('AIGATE_DB_PATH', str(tmp_path / 'api-registry.db'))
    created = client.post('/v1/registry', json=valid_payload(chatbot_or_human_interaction=True))
    assert created.status_code == 201
    sid = created.json()['id']
    listing = client.get('/v1/registry')
    assert listing.status_code == 200
    assert listing.json()['count'] == 1
    fetched = client.get(f'/v1/registry/{sid}')
    assert fetched.status_code == 200
    assert fetched.json()['audit_events'][0]['event_type'] == 'SCREENED'


def test_registry_missing_404(tmp_path, monkeypatch):
    monkeypatch.setenv('AIGATE_DB_PATH', str(tmp_path / 'api-registry.db'))
    assert client.get('/v1/registry/does-not-exist').status_code == 404
