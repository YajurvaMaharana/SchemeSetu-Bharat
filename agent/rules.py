"""Deterministic welfare schemes eligibility engine for SchemeSetu Bharat.

Strictly deterministic rule evaluation (NO LLM calls):
1. load_schemes(path="data/schemes_data.json") -> list[dict]
2. acres_to_hectares(x: float) -> float (using 0.4047)
3. evaluate_scheme(profile: CitizenProfile, scheme: dict) -> SchemeMatch
4. evaluate_all(profile: CitizenProfile, schemes: list[dict] = None) -> list[SchemeMatch]
5. rank_matches(matches: list[SchemeMatch]) -> list[SchemeMatch]
6. calc_benefits(matches: list[SchemeMatch]) -> int
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from agent.models import CitizenProfile, SchemeMatch

ACRES_TO_HECTARES: float = 0.4047


def acres_to_hectares(x: float) -> float:
    """Convert land in acres to hectares using statutory conversion 1 acre = 0.4047 ha."""
    if x is None:
        return 0.0
    return round(float(x) * ACRES_TO_HECTARES, 4)


def load_schemes(path: str = "data/schemes_data.json") -> List[Dict[str, Any]]:
    """Load scheme definitions from JSON file."""
    p = Path(path)
    if not p.exists():
        # Check relative to repo root
        repo_root = Path(__file__).resolve().parent.parent
        p = repo_root / path
    if not p.exists():
        raise FileNotFoundError(f"Could not find schemes data file at: {path}")

    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)


def evaluate_scheme(profile: CitizenProfile, scheme: Dict[str, Any]) -> SchemeMatch:
    """Evaluate a citizen profile against a single scheme deterministically.
    
    Status logic:
    - Any hard failure -> NOT_ELIGIBLE
    - No failures and nothing missing -> ELIGIBLE
    - No failures but missing fields -> NEEDS_INFO
    - Use LIKELY when scheme notes/eligibility mark criteria as uncertain/soft
    """
    scheme_id = scheme.get("scheme_id") or scheme.get("id", "")
    name = scheme.get("name") or scheme.get("short_name", "")
    annual_benefit_inr = int(scheme.get("annual_benefit_inr") or scheme.get("benefit_amount_inr", 0))
    required_documents = list(scheme.get("required_documents", []))
    direct_portal_url = scheme.get("direct_portal_url") or scheme.get("portal_url", "")
    friction_score = int(scheme.get("friction_score", 1))

    elig = scheme.get("eligibility") or scheme.get("eligibility_criteria", {})

    reasons: List[str] = []
    failures: List[str] = []
    missing_info: List[str] = []
    is_soft_criterion = False

    # 1. Occupation
    allowed_occs = [o.lower() for o in elig.get("occupations", [])]
    if allowed_occs:
        if profile.occupation is None:
            missing_info.append("Occupation")
        else:
            user_occ = profile.occupation.lower()
            if user_occ in allowed_occs or any(user_occ in o or o in user_occ for o in allowed_occs):
                reasons.append(f"Occupation '{profile.occupation}' matches scheme requirement.")
            else:
                failures.append(f"Occupation '{profile.occupation}' does not match required: {', '.join(allowed_occs)}.")

    # 2. Age Restrictions (Min and Max)
    min_age = elig.get("min_age")
    max_age = elig.get("max_age")
    if min_age is not None or max_age is not None:
        if profile.age is None:
            missing_info.append("Age")
        else:
            if min_age is not None and profile.age < min_age:
                failures.append(f"Age {profile.age} is below minimum requirement of {min_age} years.")
            elif max_age is not None and profile.age > max_age:
                failures.append(f"Age {profile.age} exceeds maximum limit of {max_age} years.")
            else:
                if min_age is not None and max_age is not None:
                    reasons.append(f"Age {profile.age} is within eligible range ({min_age} to {max_age} years).")
                elif min_age is not None:
                    reasons.append(f"Age {profile.age} meets minimum age limit of {min_age} years.")
                else:
                    reasons.append(f"Age {profile.age} is within maximum limit of {max_age} years.")

    # 3. Gender
    allowed_genders = [g.lower() for g in elig.get("genders", [])]
    if allowed_genders:
        if profile.gender is None:
            missing_info.append("Gender")
        else:
            user_gender = profile.gender.lower()
            if user_gender in allowed_genders:
                reasons.append(f"Gender '{profile.gender}' meets scheme requirement.")
            else:
                failures.append(f"Scheme restricted to {', '.join(allowed_genders)}; applicant is '{profile.gender}'.")

    # 4. Income Cap
    max_income = elig.get("max_income_inr")
    if max_income is not None:
        if profile.annual_income_inr is None:
            missing_info.append("Annual Income")
        else:
            if profile.annual_income_inr > max_income:
                failures.append(f"Income Rs {profile.annual_income_inr:,} exceeds the cap of Rs {max_income:,}.")
            else:
                reasons.append(f"Income Rs {profile.annual_income_inr:,} is below the cap of Rs {max_income:,}.")

    # 5. Landholding Cap
    max_land = elig.get("max_land_hectares")
    if max_land is not None:
        if profile.land_hectares is None:
            missing_info.append("Landholding (hectares)")
        else:
            if profile.land_hectares > max_land:
                failures.append(f"Land {profile.land_hectares:.2f} ha exceeds the cap of {max_land} ha.")
            else:
                reasons.append(f"Land {profile.land_hectares:.2f} ha is within the limit of {max_land} ha.")

    # Land ownership requirement (e.g. PM-KISAN cultivable landholder requirement)
    if elig.get("requires_land_ownership"):
        if profile.land_hectares is not None:
            if profile.land_hectares <= 0:
                failures.append("Scheme requires ownership of cultivable agricultural land; profile indicates 0 hectares.")
            else:
                reasons.append(f"Land {profile.land_hectares:.2f} ha is cultivable landholding.")
        elif profile.has_land_ownership is False:
            failures.append("Scheme requires ownership of cultivable agricultural land.")
        elif profile.land_acres is not None and profile.land_acres > 0:
            converted = acres_to_hectares(profile.land_acres)
            reasons.append(f"Land {converted:.2f} ha is cultivable landholding.")
        elif profile.has_land_ownership is None and profile.land_hectares is None and profile.land_acres is None:
            missing_info.append("Land Ownership Details")

    # 6. Caste Category
    allowed_castes = [c.lower() for c in elig.get("caste_categories", [])]
    if allowed_castes:
        caste_val = profile.caste_category or profile.social_category
        if caste_val is None:
            missing_info.append("Caste Category")
        else:
            user_caste = caste_val.lower()
            if user_caste in allowed_castes:
                reasons.append(f"Caste category '{caste_val}' is eligible.")
            else:
                failures.append(f"Caste category '{caste_val}' does not qualify (requires {', '.join(allowed_castes)}).")

    # 7. BPL Requirement
    requires_bpl = elig.get("requires_bpl")
    if requires_bpl is True:
        if profile.is_bpl is None:
            missing_info.append("BPL / Ration Card Status")
        elif profile.is_bpl is False:
            failures.append("Scheme strictly requires BPL / SECC deprivation status; profile indicates non-BPL.")
        else:
            reasons.append("BPL / SECC status requirement satisfied.")

    # 8. No Pucca House Requirement (PMAY-G)
    requires_no_pucca = elig.get("requires_no_pucca_house")
    if requires_no_pucca is True:
        if profile.has_pucca_house is None and profile.housing_type is None:
            missing_info.append("Housing Dwelling Type (Pucca/Kutcha)")
        else:
            is_pucca = profile.has_pucca_house is True or (profile.housing_type and profile.housing_type.lower() == "pucca")
            if is_pucca:
                failures.append("Scheme strictly requires Kutcha or homeless dwelling; applicant owns a Pucca house.")
            else:
                reasons.append("No-pucca-house requirement verified.")

    # 9. No Existing LPG Requirement (Ujjwala 2.0)
    requires_no_lpg = elig.get("requires_no_lpg")
    if requires_no_lpg is True:
        if profile.has_lpg_connection is None:
            missing_info.append("Existing LPG Connection Status")
        elif profile.has_lpg_connection is True:
            failures.append("Scheme requires no existing LPG connection in household; profile indicates active LPG.")
        else:
            reasons.append("Household has no existing LPG connection.")

    # 10. Education Level
    allowed_edus = [e.lower() for e in elig.get("education_levels", [])]
    if allowed_edus:
        if profile.education_level is None:
            missing_info.append("Education Level")
        else:
            user_edu = profile.education_level.lower()
            if user_edu in allowed_edus:
                reasons.append(f"Education level '{profile.education_level}' qualifies for post-matric benefits.")
            else:
                failures.append(f"Education level '{profile.education_level}' does not match required: {', '.join(allowed_edus)}.")

    # 11. Excluded Categories Checks
    excluded = elig.get("excluded_categories", [])
    if profile.is_taxpayer:
        if any("tax" in ex.lower() for ex in excluded):
            failures.append("Disqualified under statutory exclusion: Income tax payer.")
    if profile.is_govt_employee:
        if any("govt" in ex.lower() or "government" in ex.lower() for ex in excluded):
            failures.append("Disqualified under statutory exclusion: Government employee.")
    if profile.has_pension_above_10k:
        if any("pension" in ex.lower() for ex in excluded):
            failures.append("Disqualified under statutory exclusion: Pension exceeding ₹10,000/mo.")

    # 12. Soft/Uncertain criteria check in notes
    notes = scheme.get("notes", "").lower()
    if "uncertain" in notes or "conditional" in notes or "discretionary" in notes:
        is_soft_criterion = True

    # Final Status Logic
    if len(failures) > 0:
        status = "NOT_ELIGIBLE"
        # Prepend failures to reasons for clear explanation
        final_reasons = failures + reasons
    elif len(missing_info) > 0:
        status = "NEEDS_INFO"
        final_reasons = reasons + [f"Verification required for: {', '.join(missing_info)}."]
    elif is_soft_criterion:
        status = "LIKELY"
        final_reasons = reasons + ["Subject to administrative verification of supporting documents."]
    else:
        status = "ELIGIBLE"
        final_reasons = reasons

    return SchemeMatch(
        scheme_id=scheme_id,
        name=name,
        status=status,
        annual_benefit_inr=annual_benefit_inr,
        reasons=final_reasons,
        missing_info=missing_info,
        required_documents=required_documents,
        portal_url=direct_portal_url,
        friction_score=friction_score,
        priority_rank=None,
    )


def rank_matches(matches: List[SchemeMatch]) -> List[SchemeMatch]:
    """Rank matches:
    - ELIGIBLE first, then LIKELY, then NEEDS_INFO, then NOT_ELIGIBLE.
    - Inside each group, sort by annual_benefit_inr / friction_score descending.
    - Fill priority_rank (1..n) for non-NOT_ELIGIBLE matches.
    """
    status_order = {
        "ELIGIBLE": 0,
        "LIKELY": 1,
        "NEEDS_INFO": 2,
        "NOT_ELIGIBLE": 3,
    }

    def sort_key(m: SchemeMatch):
        order = status_order.get(m.status, 99)
        friction = max(m.friction_score, 1)
        benefit_density = m.annual_benefit_inr / friction
        return (order, -benefit_density, -m.annual_benefit_inr)

    sorted_matches = sorted(matches, key=sort_key)

    rank = 1
    for m in sorted_matches:
        if m.status != "NOT_ELIGIBLE":
            m.priority_rank = rank
            rank += 1
        else:
            m.priority_rank = None

    return sorted_matches


def calc_benefits(matches: List[SchemeMatch]) -> int:
    """Sum annual_benefit_inr over ELIGIBLE and LIKELY matches."""
    return sum(m.annual_benefit_inr for m in matches if m.status in ("ELIGIBLE", "LIKELY"))


def evaluate_all(
    profile: CitizenProfile,
    schemes: Optional[List[Dict[str, Any]]] = None,
) -> List[SchemeMatch]:
    """Evaluate profile across all loaded schemes and return sorted ranked matches."""
    if schemes is None:
        schemes = load_schemes()

    raw_matches = [evaluate_scheme(profile, s) for s in schemes]
    return rank_matches(raw_matches)
