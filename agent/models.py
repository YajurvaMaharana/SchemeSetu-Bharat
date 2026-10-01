"""Pydantic v2 data models for SchemeSetu Bharat.

Adheres strictly to the specification:
- CitizenProfile: name, age (int), gender (male/female/other), occupation (farmer, agricultural_worker, student, labourer,
  homemaker, other), state, district, pin_code, annual_income_inr (int), land_hectares (float),
  caste_category (general/obc/sc/st), is_bpl (bool), has_pucca_house (bool), has_lpg_connection (bool),
  education_level (school/undergraduate/postgraduate/other), language (default "hi").
  Every field except language is Optional, default None.
- SchemeMatch: scheme_id, name, status (ELIGIBLE | LIKELY | NEEDS_INFO | NOT_ELIGIBLE),
  annual_benefit_inr (int), reasons (list[str]), missing_info (list[str]),
  required_documents (list[str]), portal_url (str), friction_score (int 1-5, 1 = easiest),
  priority_rank (int | None).
- AgentEvent: kind (thought | tool_call | tool_result | final | error), title (str), detail (str),
  timestamp (str HH:MM:SS, auto-filled with a default_factory).
- AgentResult: profile (CitizenProfile), matches (list[SchemeMatch]), total_annual_benefit_inr (int),
  csc_center (dict | None), application_payloads (dict[str, dict]), pdf_path (str | None),
  events (list[AgentEvent]), used_fallback (bool, default False), explanation (str, default "").
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Literal, Optional, Union
from pydantic import BaseModel, Field, model_validator

ACRES_TO_HECTARES: float = 0.4047


class SocialCategory(str, Enum):
    GENERAL = "general"
    OBC = "obc"
    SC = "sc"
    ST = "st"
    ALL = "all"


class HousingType(str, Enum):
    PUCCA = "Pucca"
    KUTCHA = "Kutcha"
    HOMELESS = "Homeless"
    RENTED = "Rented"


class EligibilityStatus(str, Enum):
    ELIGIBLE = "ELIGIBLE"
    LIKELY = "LIKELY"
    NEEDS_INFO = "NEEDS_INFO"
    NOT_ELIGIBLE = "NOT_ELIGIBLE"
    NEEDS_REVIEW = "NEEDS_REVIEW"


class CitizenProfile(BaseModel):
    """Citizen demographic and socio-economic profile."""

    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[Literal["male", "female", "other"]] = None
    occupation: Optional[
        Literal["farmer", "agricultural_worker", "student", "labourer", "homemaker", "other"]
    ] = None
    state: Optional[str] = None
    district: Optional[str] = None
    pin_code: Optional[str] = None
    annual_income_inr: Optional[int] = None
    land_hectares: Optional[float] = None
    caste_category: Optional[Literal["general", "obc", "sc", "st"]] = None
    is_bpl: Optional[bool] = None
    has_pucca_house: Optional[bool] = None
    has_lpg_connection: Optional[bool] = None
    education_level: Optional[
        Literal["school", "undergraduate", "postgraduate", "other"]
    ] = None
    language: str = "hi"

    # Compatibility attributes for agent engines
    pincode: Optional[str] = None
    land_acres: Optional[float] = None
    social_category: Optional[str] = None
    housing_type: Optional[str] = None
    has_land_ownership: Optional[bool] = None
    is_taxpayer: Optional[bool] = False
    is_govt_employee: Optional[bool] = False
    has_pension_above_10k: Optional[bool] = False
    is_shg_member: Optional[bool] = False
    is_student: Optional[bool] = False
    special_conditions: List[str] = Field(default_factory=list)
    raw_query: Optional[str] = None
    preferred_language: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_inputs(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Normalize occupation
            occ = data.get("occupation")
            if occ and isinstance(occ, str):
                occ_lower = occ.lower().strip()
                if "farmer" in occ_lower or "kisan" in occ_lower or "krishi" in occ_lower:
                    data["occupation"] = "farmer"
                elif "agricultural" in occ_lower or "agri" in occ_lower:
                    data["occupation"] = "agricultural_worker"
                elif "student" in occ_lower or "chhatra" in occ_lower or "vidyarthi" in occ_lower:
                    data["occupation"] = "student"
                elif "labour" in occ_lower or "wage" in occ_lower or "majdoor" in occ_lower or "worker" in occ_lower:
                    data["occupation"] = "labourer"
                elif "home" in occ_lower:
                    data["occupation"] = "homemaker"
                elif occ_lower in ["farmer", "agricultural_worker", "student", "labourer", "homemaker", "other"]:
                    data["occupation"] = occ_lower
                else:
                    data["occupation"] = "other"

            # Normalize gender
            g = data.get("gender")
            if g and isinstance(g, str):
                g_lower = g.lower().strip()
                if g_lower in ["male", "female", "other"]:
                    data["gender"] = g_lower
                else:
                    data["gender"] = None

            # Normalize caste_category
            caste = data.get("caste_category") or data.get("social_category")
            if caste and isinstance(caste, str):
                c_lower = caste.lower().strip()
                if c_lower in ["general", "obc", "sc", "st"]:
                    data["caste_category"] = c_lower
                else:
                    data["caste_category"] = None

            # Normalize education_level
            edu = data.get("education_level")
            if edu and isinstance(edu, str):
                edu_lower = edu.lower().strip()
                if edu_lower in ["school", "undergraduate", "postgraduate", "other"]:
                    data["education_level"] = edu_lower
                else:
                    data["education_level"] = "other"

            # Normalize pin_code
            if "pincode" in data and "pin_code" not in data:
                data["pin_code"] = data["pincode"]

            # Normalize pucca house
            if "housing_type" in data and "has_pucca_house" not in data:
                ht = str(data["housing_type"]).lower()
                data["has_pucca_house"] = (ht == "pucca")

        return data

    @model_validator(mode="after")
    def sync_and_normalize(self) -> "CitizenProfile":
        # Sync pin_code and pincode
        if self.pin_code and not self.pincode:
            self.pincode = self.pin_code
        elif self.pincode and not self.pin_code:
            self.pin_code = self.pincode

        # Sync caste_category and social_category
        if self.caste_category and not self.social_category:
            self.social_category = self.caste_category.upper()
        elif self.social_category and not self.caste_category:
            self.caste_category = self.social_category.lower()  # type: ignore

        # Sync housing
        if self.has_pucca_house is not None and not self.housing_type:
            self.housing_type = "Pucca" if self.has_pucca_house else "Kutcha"
        elif self.housing_type and self.has_pucca_house is None:
            self.has_pucca_house = self.housing_type.lower() == "pucca"

        # Sync land acres <-> hectares
        if self.land_acres is not None and self.land_hectares is None:
            self.land_hectares = round(self.land_acres * ACRES_TO_HECTARES, 4)
        elif self.land_hectares is not None and self.land_acres is None:
            self.land_acres = round(self.land_hectares / ACRES_TO_HECTARES, 2)

        if self.annual_income_inr is not None:
            self.annual_income_inr = int(round(self.annual_income_inr))

        if not self.preferred_language:
            self.preferred_language = "Hindi" if self.language == "hi" else "English"

        return self


UserProfile = CitizenProfile


class SchemeMatch(BaseModel):
    """Evaluation match for a single welfare scheme."""

    scheme_id: str
    name: str = ""
    status: Literal["ELIGIBLE", "LIKELY", "NEEDS_INFO", "NOT_ELIGIBLE", "NEEDS_REVIEW"]
    annual_benefit_inr: int = 0
    reasons: List[str] = Field(default_factory=list)
    missing_info: List[str] = Field(default_factory=list)
    required_documents: List[str] = Field(default_factory=list)
    portal_url: str = ""
    friction_score: int = Field(default=1, ge=1, le=5)
    priority_rank: Optional[int] = None

    # Compatibility attributes
    scheme_name: Optional[str] = None
    scheme_name_hi: Optional[str] = None
    category: Optional[str] = None
    benefit_amount_inr: Optional[int] = None
    benefit_description: Optional[str] = None
    benefit_frequency: Optional[str] = "Annual"
    passed_criteria: List[str] = Field(default_factory=list)
    failed_criteria: List[str] = Field(default_factory=list)
    edge_case_flags: List[str] = Field(default_factory=list)
    llm_edge_review: Optional[str] = None
    friendly_explanation: Optional[str] = None
    application_mode: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_scheme_match(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "name" not in data and "scheme_name" in data:
                data["name"] = data["scheme_name"]
            elif "scheme_name" not in data and "name" in data:
                data["scheme_name"] = data["name"]

            if "annual_benefit_inr" not in data and "benefit_amount_inr" in data:
                data["annual_benefit_inr"] = data["benefit_amount_inr"]
            elif "benefit_amount_inr" not in data and "annual_benefit_inr" in data:
                data["benefit_amount_inr"] = data["annual_benefit_inr"]

            status = data.get("status")
            if hasattr(status, "value"):
                data["status"] = status.value
        return data

    @model_validator(mode="after")
    def sync_scheme_match(self) -> "SchemeMatch":
        if not self.scheme_name:
            self.scheme_name = self.name
        if self.benefit_amount_inr is None:
            self.benefit_amount_inr = self.annual_benefit_inr
        return self


SchemeEligibilityResult = SchemeMatch


class AgentEvent(BaseModel):
    """Telemetry event emitted during agent reasoning and tool usage."""

    kind: Literal["thought", "tool_call", "tool_result", "final", "error"] = "thought"
    title: str = ""
    detail: str = ""
    timestamp: str = Field(default_factory=lambda: datetime.now().strftime("%H:%M:%S"))

    # Compatibility attributes
    step: Optional[str] = None
    status: Optional[str] = None
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    simulated: bool = False

    @model_validator(mode="before")
    @classmethod
    def normalize_event(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "title" not in data and "step" in data:
                data["title"] = data["step"]
            if "detail" not in data and "message" in data:
                data["detail"] = data["message"]
            if "kind" not in data:
                step = str(data.get("step", "")).upper()
                if "LOCATOR" in step or "SUBMISSION" in step:
                    data["kind"] = "tool_call"
                elif "DELIVER" in step:
                    data["kind"] = "final"
                else:
                    data["kind"] = "thought"
        return data

    @model_validator(mode="after")
    def sync_event(self) -> "AgentEvent":
        if self.step and not self.title:
            self.title = self.step
        if self.message and not self.detail:
            self.detail = self.message
        return self


class AgentResult(BaseModel):
    """Unified result produced by the SchemeSetu agent."""

    profile: CitizenProfile
    matches: List[SchemeMatch]
    total_annual_benefit_inr: int
    csc_center: Optional[Dict[str, Any]] = None
    application_payloads: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    pdf_path: Optional[str] = None
    events: List[AgentEvent] = Field(default_factory=list)
    used_fallback: bool = False
    explanation: str = ""

    @model_validator(mode="before")
    @classmethod
    def normalize_result(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "profile" not in data and "user_profile" in data:
                data["profile"] = data["user_profile"]
            if "matches" not in data:
                el = data.get("eligible_schemes", [])
                rv = data.get("review_schemes", [])
                inel = data.get("ineligible_schemes", [])
                data["matches"] = list(el) + list(rv) + list(inel)
            if "total_annual_benefit_inr" not in data and "total_potential_benefit_inr" in data:
                data["total_annual_benefit_inr"] = data["total_potential_benefit_inr"]
            if "csc_center" not in data and "csc_recommendation" in data:
                data["csc_center"] = data["csc_recommendation"]
            if "explanation" not in data:
                data["explanation"] = data.get("summary_text") or data.get("vernacular_summary", "")
        return data

    # Compatibility attributes
    user_profile: Optional[CitizenProfile] = None
    eligible_schemes: List[SchemeMatch] = Field(default_factory=list)
    review_schemes: List[SchemeMatch] = Field(default_factory=list)
    ineligible_schemes: List[SchemeMatch] = Field(default_factory=list)
    total_potential_benefit_inr: Optional[int] = None
    summary_text: Optional[str] = None
    vernacular_summary: Optional[str] = None
    csc_recommendation: Optional[Dict[str, Any]] = None
    mock_submission: Optional[Dict[str, Any]] = None

    @model_validator(mode="after")
    def sync_result(self) -> "AgentResult":
        if not self.user_profile:
            self.user_profile = self.profile
        if self.total_potential_benefit_inr is None:
            self.total_potential_benefit_inr = self.total_annual_benefit_inr
        if not self.summary_text:
            self.summary_text = self.explanation
        if not self.vernacular_summary:
            self.vernacular_summary = self.explanation
        if not self.csc_recommendation:
            self.csc_recommendation = self.csc_center
        return self


AgentResponse = AgentResult


class Scheme(BaseModel):
    """Raw scheme record from data/schemes_data.json."""

    id: str = ""
    scheme_id: Optional[str] = None
    name: str = ""
    short_name: Optional[str] = None
    name_hi: Optional[str] = None
    ministry: str = ""
    category: str = "General"
    target_audience: List[str] = Field(default_factory=list)
    benefit_type: str = "Welfare"
    benefit_amount_inr: int = 0
    annual_benefit_inr: Optional[int] = None
    benefit_description: str = ""
    benefit_frequency: str = "Annual"
    eligibility_criteria: Dict[str, Any] = Field(default_factory=dict)
    eligibility: Optional[Dict[str, Any]] = None
    edge_cases: List[str] = Field(default_factory=list)
    required_documents: List[str] = Field(default_factory=list)
    application_steps: List[str] = Field(default_factory=list)
    application_mode: Optional[str] = None
    portal_url: Optional[str] = None
    direct_portal_url: Optional[str] = None
    action_type: Optional[str] = None
    friction_score: Optional[int] = 1
    processing_time: Optional[str] = None
    source_url: Optional[str] = None
    last_verified: Optional[str] = None
    notes: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_scheme(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "id" not in data and "scheme_id" in data:
                data["id"] = data["scheme_id"]
            if "scheme_id" not in data and "id" in data:
                data["scheme_id"] = data["id"]
            if "benefit_amount_inr" not in data and "annual_benefit_inr" in data:
                data["benefit_amount_inr"] = data["annual_benefit_inr"]
            if "annual_benefit_inr" not in data and "benefit_amount_inr" in data:
                data["annual_benefit_inr"] = data["benefit_amount_inr"]
            if "eligibility_criteria" not in data and "eligibility" in data:
                data["eligibility_criteria"] = data["eligibility"]
            if "portal_url" not in data and "direct_portal_url" in data:
                data["portal_url"] = data["direct_portal_url"]
        return data
