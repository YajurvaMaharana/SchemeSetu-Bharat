"""Pydantic v2 data models for SchemeSetu Bharat.

Adheres to:
- Money = integer INR
- Land = hectares (1 acre = 0.4047 ha)
- Type hints and Pydantic v2 validation
"""

from enum import Enum
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, model_validator

from agent.events import AgentEvent

ACRES_TO_HECTARES: float = 0.4047


class SocialCategory(str, Enum):
    GENERAL = "General"
    OBC = "OBC"
    SC = "SC"
    ST = "ST"
    ALL = "All"


class HousingType(str, Enum):
    PUCCA = "Pucca"
    KUTCHA = "Kutcha"
    HOMELESS = "Homeless"
    RENTED = "Rented"


class EligibilityStatus(str, Enum):
    ELIGIBLE = "ELIGIBLE"
    NOT_ELIGIBLE = "NOT_ELIGIBLE"
    NEEDS_REVIEW = "NEEDS_REVIEW"


class UserProfile(BaseModel):
    """Normalized citizen profile extracted from text or direct input."""

    name: Optional[str] = Field(default=None, description="Citizen's full name if provided")
    age: Optional[int] = Field(default=None, description="Age in completed years")
    gender: Optional[str] = Field(default=None, description="Gender: Male, Female, Other, or None")
    state: Optional[str] = Field(default=None, description="State of residence (e.g., Bihar, Uttar Pradesh, Maharashtra)")
    district: Optional[str] = Field(default=None, description="District name")
    pincode: Optional[str] = Field(default=None, description="6-digit postal pincode")
    occupation: Optional[str] = Field(
        default=None,
        description="Primary occupation (e.g., Farmer, Daily Wage Worker, Student, Artisan, Self-Employed)",
    )
    annual_income_inr: Optional[int] = Field(
        default=None,
        description="Total annual family income in integer INR",
    )
    land_hectares: Optional[float] = Field(
        default=None,
        description="Agricultural landholding in hectares (1 acre = 0.4047 ha)",
    )
    land_acres: Optional[float] = Field(
        default=None,
        description="Agricultural landholding specified in acres",
    )
    has_land_ownership: Optional[bool] = Field(
        default=None,
        description="Whether the citizen or family holds legal title to cultivable land",
    )
    social_category: Optional[str] = Field(
        default="General",
        description="Social category: General, OBC, SC, ST",
    )
    housing_type: Optional[str] = Field(
        default="Pucca",
        description="Type of dwelling: Pucca, Kutcha, Homeless, Rented",
    )
    is_taxpayer: Optional[bool] = Field(
        default=False,
        description="Whether applicant or spouse filed income tax in previous assessment year",
    )
    is_govt_employee: Optional[bool] = Field(
        default=False,
        description="Whether applicant or family member is serving/retired government officer",
    )
    has_pension_above_10k: Optional[bool] = Field(
        default=False,
        description="Whether applicant receives monthly pension exceeding ₹10,000",
    )
    is_shg_member: Optional[bool] = Field(
        default=False,
        description="Whether female applicant is part of a Self Help Group (SHG)",
    )
    is_student: Optional[bool] = Field(
        default=False,
        description="Whether applicant is currently an enrolled student",
    )
    special_conditions: List[str] = Field(
        default_factory=list,
        description="Edge condition flags like joint land ownership, tenant farmer, widow, disability",
    )
    raw_query: Optional[str] = Field(
        default=None,
        description="Original query text from the citizen",
    )
    preferred_language: str = Field(
        default="Hindi",
        description="Preferred language for output (e.g., Hindi, English, Marathi)",
    )

    @model_validator(mode="after")
    def convert_acres_to_hectares(self) -> "UserProfile":
        """Convert acres to hectares if land_acres is provided and land_hectares is unset."""
        if self.land_acres is not None and self.land_hectares is None:
            self.land_hectares = round(self.land_acres * ACRES_TO_HECTARES, 4)
        elif self.land_hectares is not None and self.land_acres is None:
            self.land_acres = round(self.land_hectares / ACRES_TO_HECTARES, 2)
        # Ensure income is an integer INR
        if self.annual_income_inr is not None:
            self.annual_income_inr = int(round(self.annual_income_inr))
        return self


class CriterionEvaluation(BaseModel):
    """Detailed evaluation of a single eligibility criterion."""

    criterion_name: str
    passed: bool
    reason: str
    is_edge_case: bool = False


class SchemeEligibilityResult(BaseModel):
    """Evaluation result for one welfare scheme."""

    scheme_id: str
    scheme_name: str
    scheme_name_hi: Optional[str] = None
    category: str
    status: EligibilityStatus
    benefit_amount_inr: int
    benefit_description: str
    benefit_frequency: str
    passed_criteria: List[str] = Field(default_factory=list)
    failed_criteria: List[str] = Field(default_factory=list)
    edge_case_flags: List[str] = Field(default_factory=list)
    llm_edge_review: Optional[str] = Field(
        default=None,
        description="LLM review of flagged edge cases. Invariant: Cannot flip NOT_ELIGIBLE to ELIGIBLE",
    )
    friendly_explanation: Optional[str] = Field(
        default=None,
        description="Plain-language explanation for the citizen",
    )
    required_documents: List[str] = Field(default_factory=list)
    portal_url: Optional[str] = None
    application_mode: Optional[str] = None


class Scheme(BaseModel):
    """Raw scheme record from data/schemes_data.json."""

    id: str
    name: str
    name_hi: Optional[str] = None
    ministry: str
    category: str
    target_audience: List[str]
    benefit_type: str
    benefit_amount_inr: int
    benefit_description: str
    benefit_frequency: str
    eligibility_criteria: Dict[str, Any]
    edge_cases: List[str] = Field(default_factory=list)
    required_documents: List[str] = Field(default_factory=list)
    application_mode: Optional[str] = None
    portal_url: Optional[str] = None


class AgentResponse(BaseModel):
    """Final unified response returned by SchemeSetu agent."""

    user_profile: UserProfile
    eligible_schemes: List[SchemeEligibilityResult] = Field(default_factory=list)
    review_schemes: List[SchemeEligibilityResult] = Field(default_factory=list)
    ineligible_schemes: List[SchemeEligibilityResult] = Field(default_factory=list)
    total_potential_benefit_inr: int = 0
    summary_text: str = ""
    vernacular_summary: Optional[str] = None
    csc_recommendation: Optional[Dict[str, Any]] = None
    mock_submission: Optional[Dict[str, Any]] = None
    events: List[AgentEvent] = Field(default_factory=list)
