"""SchemeSetu Bharat Agent package.

Empowering Indian citizens to discover, verify eligibility deterministically,
and apply for government welfare schemes.
"""

from agent.events import AgentEvent, AgentEventCallback
from agent.models import (
    ACRES_TO_HECTARES,
    AgentResponse,
    EligibilityStatus,
    HousingType,
    Scheme,
    SchemeEligibilityResult,
    SocialCategory,
    UserProfile,
)
from agent.orchestrator import SchemeSetuAgent
from agent.profile_extractor import extract_user_profile
from agent.rules_engine import (
    evaluate_all_schemes,
    evaluate_single_scheme,
    load_schemes_data,
)
from agent.simulated_tools import locate_nearest_csc, mock_portal_submission

from agent.agent import run_agent
from agent.models import (
    CitizenProfile,
    SchemeMatch,
    AgentResult,
)

__all__ = [
    "SchemeSetuAgent",
    "run_agent",
    "AgentEvent",
    "AgentEventCallback",
    "UserProfile",
    "CitizenProfile",
    "Scheme",
    "EligibilityStatus",
    "SchemeEligibilityResult",
    "SchemeMatch",
    "AgentResponse",
    "AgentResult",
    "SocialCategory",
    "HousingType",
    "ACRES_TO_HECTARES",
    "extract_user_profile",
    "evaluate_all_schemes",
    "evaluate_single_scheme",
    "load_schemes_data",
    "locate_nearest_csc",
    "mock_portal_submission",
]
