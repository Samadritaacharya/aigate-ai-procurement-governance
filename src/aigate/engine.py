from __future__ import annotations

from .ai import optional_local_model_summary
from .models import ScreeningResult, UseCase
from .policy import screen


def evaluate_use_case(uc: UseCase) -> ScreeningResult:
    result = screen(uc)
    result.ai_summary = optional_local_model_summary(uc, result)
    return result
