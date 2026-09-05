from __future__ import annotations

from src.aigate.engine import evaluate_use_case
from src.aigate.models import UseCase
from src.aigate.policy import classify, screen


def uc(**kwargs):
    base = {'name': 'Test use case', 'purpose': 'A sufficiently detailed enterprise AI use case for governance screening.'}
    base.update(kwargs)
    return UseCase(**base)


def test_minimal_default():
    r = screen(uc())
    assert r.risk_band == 'minimal'
    assert r.decision == 'STANDARD_REVIEW'


def test_transparency_chatbot():
    r = screen(uc(chatbot_or_human_interaction=True))
    assert r.risk_band == 'transparency'
    assert r.decision == 'CONTROL_REVIEW'


def test_transparency_synthetic_media():
    assert screen(uc(synthetic_media_generation=True)).risk_band == 'transparency'


def test_employment_is_high_risk_candidate():
    r = screen(uc(employment_decisions=True, personal_data=True))
    assert r.risk_band == 'high-risk-candidate'
    assert 'Legal / AI Governance' in r.approval_route


def test_education_is_high_risk_candidate():
    assert screen(uc(education_admissions=True)).risk_band == 'high-risk-candidate'


def test_critical_infrastructure_is_high_risk_candidate():
    assert screen(uc(critical_infrastructure_safety=True)).risk_band == 'high-risk-candidate'


def test_prohibited_beats_high_risk():
    r = screen(uc(social_scoring=True, employment_decisions=True))
    assert r.risk_band == 'prohibited-review'
    assert r.decision == 'BLOCK_AND_LEGAL_REVIEW'


def test_workplace_emotion_indicator_blocks():
    assert screen(uc(workplace_emotion_recognition=True)).decision == 'BLOCK_AND_LEGAL_REVIEW'


def test_sensitive_biometric_indicator_blocks():
    assert screen(uc(biometric_sensitive_categorization=True)).risk_band == 'prohibited-review'


def test_profile_only_predictive_policing_indicator_blocks():
    assert screen(uc(predictive_policing_profile_only=True)).risk_band == 'prohibited-review'


def test_vendor_route_adds_procurement():
    r = screen(uc(vendor='External Vendor'))
    assert 'Procurement' in r.approval_route


def test_personal_data_adds_privacy_route():
    r = screen(uc(personal_data=True))
    assert 'Privacy / DPO' in r.approval_route


def test_vendor_score_improves_with_evidence():
    low = screen(uc(vendor='External Vendor'))
    high = screen(uc(vendor='External Vendor', contract_dpa=True, subprocessor_inventory=True, model_card_or_system_card=True, exit_plan=True))
    assert high.vendor_score > low.vendor_score


def test_evidence_score_improves_when_controls_present():
    low = screen(uc(vendor='External Vendor', personal_data=True))
    high = screen(uc(vendor='External Vendor', personal_data=True, contract_dpa=True, subprocessor_inventory=True, exit_plan=True, incident_process=True, dpia_or_privacy_review=True))
    assert high.evidence_score > low.evidence_score


def test_value_case_math():
    r = screen(uc(annual_volume=10000, hours_saved_per_case=.1, value_per_hour_eur=50, implementation_cost_eur=20000, annual_run_cost_eur=10000))
    assert r.annual_benefit_eur == 50000
    assert r.annual_net_value_eur == 40000
    assert r.roi_pct == 100.0
    assert r.payback_months == 6.0


def test_no_payback_when_net_negative():
    r = screen(uc(annual_volume=1000, hours_saved_per_case=.01, value_per_hour_eur=10, annual_run_cost_eur=20000))
    assert r.payback_months is None


def test_ai_summary_cannot_change_decision(monkeypatch):
    monkeypatch.delenv('AIGATE_LLM_BASE_URL', raising=False)
    r = evaluate_use_case(uc(employment_decisions=True))
    assert r.decision == 'HUMAN_APPROVAL_REQUIRED'
    assert 'deterministic policy' in r.ai_summary


def test_classify_returns_reason():
    band, reasons = classify(uc(chatbot_or_human_interaction=True))
    assert band == 'transparency'
    assert reasons


def test_high_risk_controls_can_be_satisfied_by_evidence():
    r = screen(uc(
        employment_decisions=True,
        personal_data=True,
        formal_risk_management_file=True,
        legal_classification_review=True,
        human_oversight=True,
        logging_enabled=True,
        evaluation_plan=True,
        incident_process=True,
        dpia_or_privacy_review=True,
        data_minimisation_policy=True,
        exit_plan=True,
    ))
    assert 'Formal risk-management file' not in r.missing_controls
    assert 'Legal/compliance classification review' not in r.missing_controls


def test_transparency_control_can_be_marked_ready():
    r = screen(uc(chatbot_or_human_interaction=True, ai_disclosure_ready=True, incident_process=True, exit_plan=True))
    assert 'User-facing AI disclosure' not in r.missing_controls
