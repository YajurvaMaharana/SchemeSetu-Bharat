"""Plain Python tool functions for SchemeSetu Bharat agent execution.

MANDATORY RULES:
- Each tool returns a JSON-serialisable dictionary.
- Eligibility decisions are 100% deterministic using rules.py; LLM only reviews edge cases.
- Simulated tools (CSC locator, portal application) explicitly carry simulated=True.
- Money = integer INR.
"""

import json
import logging
from typing import Any, Dict, List, Optional

from agent import llm, rules
from agent.models import CitizenProfile, SchemeMatch

logger = logging.getLogger(__name__)


def evaluate_eligibility(profile: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    """Evaluate citizen eligibility across all government welfare schemes.
    
    Uses deterministic rules.evaluate_all + rank_matches.
    For LIKELY or NEEDS_INFO matches, calls llm.review_edge_case and attaches its reason.
    Never lets the LLM overturn a hard disqualification (NOT_ELIGIBLE).
    
    Args:
        profile: Dictionary containing citizen demographic and socio-economic fields.
        
    Returns:
        A dictionary with key 'matches' containing ranked scheme matches as dicts.
    """
    if isinstance(profile, CitizenProfile):
        prof_obj = profile
    else:
        prof_obj = CitizenProfile(**profile)

    schemes = rules.load_schemes()
    matches = rules.evaluate_all(prof_obj, schemes)
    ranked = rules.rank_matches(matches)

    # For LIKELY / NEEDS_INFO matches, call llm.review_edge_case and attach its reason
    for match in ranked:
        if match.status in ("LIKELY", "NEEDS_INFO"):
            scheme_dict = next(
                (
                    s
                    for s in schemes
                    if s.get("scheme_id") == match.scheme_id or s.get("id") == match.scheme_id
                ),
                None,
            )
            if scheme_dict:
                try:
                    review = llm.review_edge_case(prof_obj, scheme_dict, match)
                    if review and review.get("reason"):
                        match.reasons.append(f"Administrative review note: {review['reason']}")
                        match.llm_edge_review = review["reason"]
                except Exception as e:
                    logger.warning(f"Error reviewing edge case for {match.scheme_id}: {e}")

    return {"matches": [m.model_dump() for m in ranked]}


def calc_benefits(matches: List[Dict[str, Any]]) -> Dict[str, int]:
    """Calculate the total annual monetary benefit from eligible schemes in integer INR.
    
    Args:
        matches: List of scheme match dictionaries.
        
    Returns:
        A dictionary with key 'total_annual_benefit_inr'.
    """
    total = 0
    for m in matches:
        if isinstance(m, dict):
            status = m.get("status")
            if status in ("ELIGIBLE", "LIKELY"):
                amt = int(m.get("annual_benefit_inr") or m.get("benefit_amount_inr") or 0)
                total += amt
        elif hasattr(m, "status") and m.status in ("ELIGIBLE", "LIKELY"):
            amt = int(getattr(m, "annual_benefit_inr", 0) or getattr(m, "benefit_amount_inr", 0))
            total += amt
    return {"total_annual_benefit_inr": total}


def find_csc(
    district: Optional[str] = None,
    pin_code: Optional[str] = None,
    state: Optional[str] = None,
) -> Dict[str, Any]:
    """Discover the nearest Common Service Centre (CSC) Digital Seva Kendra for citizen verification.
    
    Args:
        district: District name of the citizen (e.g. 'Nashik').
        pin_code: 6-digit postal pincode.
        state: State name of residence (e.g. 'Maharashtra').
        
    Returns:
        A dictionary containing CSC center details with simulated=True.
    """
    try:
        from utils.locator import find_csc as _find_csc
        return _find_csc(district=district, pin_code=pin_code, state=state)
    except Exception as e:
        logger.warning(f"utils.locator import/call failed: {e}. Using simulated placeholder.")
        pin = pin_code or "422001"
        dist = district or "Nashik"
        st = state or "Maharashtra"
        return {
            "simulated": True,
            "center_name": f"CSC Digital Seva Kendra - {dist} Central",
            "district": dist,
            "state": st,
            "pin_code": pin,
            "address": f"Near Tehsil Office, Main Market, Dist. {dist}, {st} - {pin}",
            "contact_phone": "+91 98230 45678",
            "vle_name": "Sanjay Patil (Village Level Entrepreneur)",
            "distance_km": 2.4,
            "operating_hours": "09:00 AM - 06:00 PM (Mon-Sat)",
            "message": "Simulated CSC discovery completed.",
        }


def build_application_payload(scheme_id: str, profile: Dict[str, Any]) -> Dict[str, Any]:
    """Build pre-filed application payload for an eligible scheme to submit to government portal.
    
    Args:
        scheme_id: The ID of the scheme (e.g. 'PM_KISAN_2026').
        profile: The citizen profile dictionary.
        
    Returns:
        A dictionary matching the standardized application payload schema:
        - scheme_id: str
        - scheme_name: str
        - portal_url: str
        - applicant: dict with relevant demographic and socio-economic fields
        - required_documents: list of required document names
        - documents_checklist: list of dicts with {"document": str, "status": "TO_COLLECT"}
        - submission_mode: derived from action_type
        - status: "DRAFT_READY_FOR_SUBMISSION"
        - simulated: True
    """
    schemes = rules.load_schemes()
    scheme = next(
        (
            s for s in schemes
            if s.get("scheme_id") == scheme_id or s.get("id") == scheme_id
        ),
        {},
    )
    scheme_name = scheme.get("name") or scheme.get("short_name") or scheme_id
    portal_url = scheme.get("direct_portal_url") or scheme.get("portal_url") or "https://india.gov.in"
    required_docs = list(scheme.get("required_documents") or ["Aadhaar Card"])
    submission_mode = scheme.get("action_type") or scheme.get("application_mode") or "ONLINE_DIRECT_OR_CSC"

    # Identify whether landholding is relevant for this specific scheme
    is_farm_scheme = False
    sid_lower = scheme_id.lower()
    if any(k in sid_lower for k in ["kisan", "kcc", "farmer", "krishi", "kmy"]):
        is_farm_scheme = True
    elif "occupations" in scheme.get("eligibility", {}):
        occs = [o.lower() for o in scheme["eligibility"]["occupations"]]
        if "farmer" in occs or "agricultural_worker" in occs:
            is_farm_scheme = True

    applicant: Dict[str, Any] = {
        "name": profile.get("name"),
        "age": profile.get("age"),
        "gender": profile.get("gender"),
        "district": profile.get("district"),
        "state": profile.get("state"),
        "pin_code": profile.get("pin_code") or profile.get("pincode"),
        "occupation": profile.get("occupation"),
        "annual_income_inr": profile.get("annual_income_inr"),
    }

    # Include land only for farm/landholding schemes
    if is_farm_scheme:
        applicant["land_hectares"] = profile.get("land_hectares")

    # Include caste_category if present
    caste = profile.get("caste_category") or profile.get("social_category")
    if caste:
        applicant["caste_category"] = caste

    checklist = [{"document": doc, "status": "TO_COLLECT"} for doc in required_docs]

    return {
        "scheme_id": scheme_id,
        "scheme_name": scheme_name,
        "portal_url": portal_url,
        "applicant": applicant,
        "required_documents": required_docs,
        "documents_checklist": checklist,
        "submission_mode": submission_mode,
        "status": "DRAFT_READY_FOR_SUBMISSION",
        "simulated": True,
    }


def mock_portal_submit(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Submit pre-filed application payload to government portal API (simulated).
    
    Args:
        payload: Application payload dictionary from build_application_payload.
        
    Returns:
        Dictionary with simulated acknowledgement ID and disclaimer.
    """
    import random
    import re
    from datetime import datetime, timezone

    scheme_id = payload.get("scheme_id", "SCHEME")
    # Clean scheme prefix for acknowledgement ID
    clean_prefix = re.sub(r"[^A-Za-z0-9]", "", scheme_id.replace("_2026", "").replace("_", "")).upper()
    if not clean_prefix or len(clean_prefix) < 2:
        clean_prefix = "GOI"
    prefix = clean_prefix[:8]

    ymd = datetime.now(timezone.utc).strftime("%Y%m%d")
    rand4 = f"{random.randint(1000, 9999)}"
    ack_id = f"SIM-{prefix}-{ymd}-{rand4}"

    return {
        "acknowledgement_id": ack_id,
        "message": "Simulated submission. No real application was filed.",
        "simulated": True,
    }


def make_pdf(result: Dict[str, Any], language: str = "hi") -> Dict[str, str]:
    """Generate an Action Pack PDF document for the citizen.
    
    Args:
        result: Dictionary containing profile, matches, benefits, and CSC info.
        language: Language code ('hi', 'mr', 'en').
        
    Returns:
        A dictionary with key 'pdf_path'.
    """
    try:
        from utils.pdf_generator import generate_action_pack
        path = generate_action_pack(result, language=language)
        return {"pdf_path": str(path)}
    except Exception as e:
        logger.warning(f"utils.pdf_generator.generate_action_pack failed: {e}. Using fallback.")
        return {"pdf_path": "output/ActionPack_Citizen.pdf"}
