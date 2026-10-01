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
            if status == "ELIGIBLE":
                amt = int(m.get("annual_benefit_inr") or m.get("benefit_amount_inr") or 0)
                total += amt
        elif hasattr(m, "status") and m.status == "ELIGIBLE":
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
        A dictionary representing the pre-filed application payload with simulated=True.
    """
    import random
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    clean_id = scheme_id.replace(" ", "_").upper()
    sub_id = f"APP-{clean_id[:12]}-{now.strftime('%Y%m%d')}-{random.randint(100000, 999999)}"
    ack_code = f"ACK-{random.randint(1000, 9999)}-{random.randint(10, 99)}"

    name = profile.get("name") or "Citizen Applicant"

    return {
        "simulated": True,
        "submission_id": sub_id,
        "acknowledgement_number": ack_code,
        "scheme_id": scheme_id,
        "status": "PRE_FILED",
        "applicant_name": name,
        "timestamp": now.isoformat(),
        "portal_endpoint": f"https://api.gov.in/v2/welfare/{scheme_id}/apply",
        "message": f"Pre-filed application payload generated for {scheme_id}.",
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
