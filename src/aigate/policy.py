from __future__ import annotations

from .models import Decision, RiskBand, ScreeningResult, UseCase

POLICY_VERSION = '2026.09'

PROHIBITED_FLAGS: tuple[tuple[str, str], ...] = (
    ('social_scoring', 'Social-scoring indicator requires an immediate legal/compliance stop.'),
    ('manipulative_or_subliminal', 'Manipulative or subliminal influence indicator requires legal review.'),
    ('biometric_sensitive_categorization', 'Sensitive biometric categorisation indicator requires legal review.'),
    ('workplace_emotion_recognition', 'Workplace emotion-recognition indicator requires legal review.'),
    ('predictive_policing_profile_only', 'Profile-only predictive-policing indicator requires legal review.'),
)

HIGH_RISK_FLAGS: tuple[tuple[str, str], ...] = (
    ('employment_decisions', 'Employment decision/support use case is a high-risk candidate.'),
    ('education_admissions', 'Education admission/assessment use case is a high-risk candidate.'),
    ('essential_services_decisions', 'Essential-services eligibility/access decision is a high-risk candidate.'),
    ('biometric_identification', 'Biometric identification use case is a high-risk candidate.'),
    ('critical_infrastructure_safety', 'Critical-infrastructure safety use case is a high-risk candidate.'),
    ('regulated_product_safety_component', 'Regulated-product safety component is a high-risk candidate.'),
)


def _bool_count(uc: UseCase, fields: tuple[str, ...]) -> int:
    return sum(bool(getattr(uc, name)) for name in fields)


def classify(uc: UseCase) -> tuple[RiskBand, list[str]]:
    prohibited = [reason for field, reason in PROHIBITED_FLAGS if getattr(uc, field)]
    if prohibited:
        return 'prohibited-review', prohibited

    high = [reason for field, reason in HIGH_RISK_FLAGS if getattr(uc, field)]
    if high:
        return 'high-risk-candidate', high

    transparency = []
    if uc.chatbot_or_human_interaction:
        transparency.append('Human-interaction AI creates transparency-notice obligations.')
    if uc.synthetic_media_generation:
        transparency.append('Synthetic-content generation creates transparency/marking obligations.')
    if transparency:
        return 'transparency', transparency

    return 'minimal', ['No prohibited/high-risk/transparency trigger was detected by this screening policy.']


def required_controls(uc: UseCase, risk_band: RiskBand) -> list[str]:
    controls = ['Named business owner', 'Documented purpose and scope', 'Rollback/exit path']
    if uc.vendor != 'Internal / TBD':
        controls += ['Vendor security evidence', 'DPA / contractual data terms', 'Subprocessor inventory']
    if uc.personal_data:
        controls += ['Privacy review', 'Data minimisation and retention rules']
    if uc.special_category_data or uc.children_or_vulnerable_people:
        controls += ['DPIA / heightened privacy review', 'Access-control evidence']
    if risk_band == 'high-risk-candidate':
        controls += ['Formal risk-management file', 'Human-oversight design', 'Technical logging', 'Evaluation evidence', 'Legal/compliance classification review']
    if risk_band == 'transparency':
        controls += ['User-facing AI disclosure', 'Synthetic-content marking policy where applicable']
    if risk_band == 'prohibited-review':
        controls += ['Immediate legal/compliance review', 'No production release until prohibition analysis is closed']
    if uc.automated_external_decision:
        controls += ['Human escalation path', 'Decision contestability / appeal process']
    controls += ['Monitoring and incident process']
    return list(dict.fromkeys(controls))


def missing_controls(uc: UseCase, controls: list[str]) -> list[str]:
    missing: list[str] = []
    checks = {
        'Human-oversight design': uc.human_oversight,
        'Technical logging': uc.logging_enabled,
        'Evaluation evidence': uc.evaluation_plan,
        'Monitoring and incident process': uc.incident_process,
        'Privacy review': uc.dpia_or_privacy_review,
        'DPIA / heightened privacy review': uc.dpia_or_privacy_review,
        'Vendor security evidence': uc.security_review,
        'DPA / contractual data terms': uc.contract_dpa,
        'Subprocessor inventory': uc.subprocessor_inventory,
        'Rollback/exit path': uc.exit_plan,
        'User-facing AI disclosure': uc.ai_disclosure_ready,
        'Synthetic-content marking policy where applicable': uc.synthetic_content_marking_ready,
        'Formal risk-management file': uc.formal_risk_management_file,
        'Legal/compliance classification review': uc.legal_classification_review,
        'Immediate legal/compliance review': False,
        'No production release until prohibition analysis is closed': False,
        'Decision contestability / appeal process': uc.appeal_process,
        'Human escalation path': uc.human_oversight,
        'Data minimisation and retention rules': uc.data_minimisation_policy,
        'Access-control evidence': uc.access_control_evidence,
        'Named business owner': bool(uc.business_unit.strip()),
        'Documented purpose and scope': len(uc.purpose.strip()) >= 20,
    }
    for control in controls:
        if control in checks and not checks[control]:
            missing.append(control)
    return missing


def approval_route(uc: UseCase, risk_band: RiskBand) -> list[str]:
    route = ['Business Owner']
    if uc.vendor != 'Internal / TBD':
        route.append('Procurement')
    if uc.personal_data or uc.special_category_data:
        route.append('Privacy / DPO')
    if uc.security_review or uc.vendor != 'Internal / TBD':
        route.append('Security')
    if risk_band in {'prohibited-review', 'high-risk-candidate'}:
        route.append('Legal / AI Governance')
    route.append('Release Authority')
    return list(dict.fromkeys(route))


def value_case(uc: UseCase) -> tuple[float, float, float, float | None]:
    annual_benefit = max(0.0, uc.annual_volume * uc.hours_saved_per_case * uc.value_per_hour_eur)
    annual_net = annual_benefit - max(0.0, uc.annual_run_cost_eur)
    investment = max(0.0, uc.implementation_cost_eur)
    roi = ((annual_benefit - uc.annual_run_cost_eur - investment) / investment * 100.0) if investment > 0 else 0.0
    monthly_net = annual_net / 12.0
    payback = (investment / monthly_net) if monthly_net > 0 else None
    return round(annual_benefit, 2), round(annual_net, 2), round(roi, 1), round(payback, 1) if payback is not None else None


def vendor_score(uc: UseCase) -> int:
    if uc.vendor == 'Internal / TBD':
        return 70
    evidence = [
        uc.security_review,
        uc.contract_dpa,
        uc.eu_data_residency,
        uc.subprocessor_inventory,
        uc.model_card_or_system_card,
        uc.exit_plan,
    ]
    return round(sum(evidence) / len(evidence) * 100)


def screen(uc: UseCase) -> ScreeningResult:
    risk_band, reasons = classify(uc)
    controls = required_controls(uc, risk_band)
    missing = missing_controls(uc, controls)
    route = approval_route(uc, risk_band)
    evidence_score = max(0, min(100, round((len(controls) - len(missing)) / max(len(controls), 1) * 100)))
    v_score = vendor_score(uc)

    if risk_band == 'prohibited-review':
        decision: Decision = 'BLOCK_AND_LEGAL_REVIEW'
        risk_penalty = 40
    elif risk_band == 'high-risk-candidate':
        decision = 'HUMAN_APPROVAL_REQUIRED'
        risk_penalty = 20
    elif risk_band == 'transparency':
        decision = 'CONTROL_REVIEW'
        risk_penalty = 10
    else:
        decision = 'STANDARD_REVIEW'
        risk_penalty = 0

    readiness = max(0, min(100, round(evidence_score * 0.7 + v_score * 0.3 - risk_penalty)))
    annual_benefit, annual_net, roi, payback = value_case(uc)

    graph = [
        {'from': 'Use Case', 'to': uc.business_unit, 'type': 'owned-by'},
        {'from': 'Use Case', 'to': uc.vendor, 'type': 'uses-vendor'},
        {'from': uc.vendor, 'to': uc.model, 'type': 'provides-model'},
        {'from': 'Use Case', 'to': risk_band, 'type': 'screened-as'},
        {'from': risk_band, 'to': decision, 'type': 'routes-to'},
    ] + [{'from': decision, 'to': role, 'type': 'approval'} for role in route]

    return ScreeningResult(
        risk_band=risk_band,
        decision=decision,
        reasons=reasons,
        required_controls=controls,
        missing_controls=missing,
        approval_route=route,
        evidence_score=evidence_score,
        vendor_score=v_score,
        readiness_score=readiness,
        annual_benefit_eur=annual_benefit,
        annual_net_value_eur=annual_net,
        roi_pct=roi,
        payback_months=payback,
        policy_version=POLICY_VERSION,
        evidence_graph=graph,
    )
