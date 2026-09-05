from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Literal

RiskBand = Literal['prohibited-review', 'high-risk-candidate', 'transparency', 'minimal']
Decision = Literal['BLOCK_AND_LEGAL_REVIEW', 'HUMAN_APPROVAL_REQUIRED', 'CONTROL_REVIEW', 'STANDARD_REVIEW']


@dataclass(slots=True)
class UseCase:
    name: str
    purpose: str
    business_unit: str = 'Digital Transformation'
    role: str = 'deployer'
    vendor: str = 'Internal / TBD'
    model: str = 'Unspecified'
    domain: str = 'general'
    users: str = 'employees'
    annual_volume: int = 10000
    hours_saved_per_case: float = 0.05
    value_per_hour_eur: float = 55.0
    implementation_cost_eur: float = 25000.0
    annual_run_cost_eur: float = 12000.0
    personal_data: bool = False
    special_category_data: bool = False
    children_or_vulnerable_people: bool = False
    employment_decisions: bool = False
    education_admissions: bool = False
    essential_services_decisions: bool = False
    biometric_identification: bool = False
    biometric_sensitive_categorization: bool = False
    workplace_emotion_recognition: bool = False
    social_scoring: bool = False
    manipulative_or_subliminal: bool = False
    predictive_policing_profile_only: bool = False
    critical_infrastructure_safety: bool = False
    regulated_product_safety_component: bool = False
    chatbot_or_human_interaction: bool = False
    synthetic_media_generation: bool = False
    automated_external_decision: bool = False
    human_oversight: bool = True
    logging_enabled: bool = True
    evaluation_plan: bool = True
    incident_process: bool = False
    dpia_or_privacy_review: bool = False
    security_review: bool = True
    contract_dpa: bool = False
    eu_data_residency: bool = True
    subprocessor_inventory: bool = False
    model_card_or_system_card: bool = False
    exit_plan: bool = False
    ai_disclosure_ready: bool = False
    synthetic_content_marking_ready: bool = False
    formal_risk_management_file: bool = False
    legal_classification_review: bool = False
    appeal_process: bool = False
    access_control_evidence: bool = False
    data_minimisation_policy: bool = False


@dataclass(slots=True)
class ScreeningResult:
    risk_band: RiskBand
    decision: Decision
    reasons: list[str]
    required_controls: list[str]
    missing_controls: list[str]
    approval_route: list[str]
    evidence_score: int
    vendor_score: int
    readiness_score: int
    annual_benefit_eur: float
    annual_net_value_eur: float
    roi_pct: float
    payback_months: float | None
    policy_version: str = '2026.09'
    legal_notice: str = 'Decision-support screening only; not a legal determination.'
    ai_summary: str = ''
    evidence_graph: list[dict[str, str]] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)
