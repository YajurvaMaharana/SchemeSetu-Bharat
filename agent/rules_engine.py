"""Deterministic welfare scheme eligibility evaluation engine.

MANDATORY RULES:
1. All eligibility decisions come from deterministic Python reading data/schemes_data.json.
2. The LLM may NEVER invent scheme facts or flip NOT_ELIGIBLE to ELIGIBLE.
3. Money = integer INR. Land = hectares (1 acre = 0.4047 ha).
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from agent.models import (
    ACRES_TO_HECTARES,
    EligibilityStatus,
    Scheme,
    SchemeEligibilityResult,
    UserProfile,
)


def load_schemes_data(data_path: Optional[str | Path] = None) -> List[Scheme]:
    """Load and parse scheme definitions from data/schemes_data.json."""
    if data_path is None:
        # Search relative to current file or workspace root
        base_dir = Path(__file__).resolve().parent.parent
        candidates = [
            base_dir / "data" / "schemes_data.json",
            Path.cwd() / "data" / "schemes_data.json",
            Path("data/schemes_data.json"),
        ]
        chosen = None
        for cand in candidates:
            if cand.exists():
                chosen = cand
                break
        if chosen is None:
            raise FileNotFoundError("Could not locate data/schemes_data.json")
        target = chosen
    else:
        target = Path(data_path)

    with open(target, "r", encoding="utf-8") as f:
        raw_list = json.load(f)

    return [Scheme(**item) for item in raw_list]


def evaluate_single_scheme(profile: UserProfile, scheme: Scheme) -> SchemeEligibilityResult:
    """Deterministically evaluate a citizen profile against a single welfare scheme.
    
    Returns SchemeEligibilityResult with status:
      - ELIGIBLE: All statutory criteria met.
      - NOT_ELIGIBLE: Hard disqualification or mandatory criteria violated.
      - NEEDS_REVIEW: Borderline conditions (joint land, income near threshold, tenant status) requiring review.
    """
    passed_criteria: List[str] = []
    failed_criteria: List[str] = []
    edge_case_flags: List[str] = []

    criteria = scheme.eligibility_criteria
    exclusions = criteria.get("exclusions", [])

    # -------------------------------------------------------------
    # 1. HARD EXCLUSIONS CHECK
    # -------------------------------------------------------------
    if profile.is_taxpayer:
        tax_exclusion = any("tax" in ex.lower() for ex in exclusions)
        if tax_exclusion:
            failed_criteria.append("Income Tax Payer exclusion: Statutory rules bar income taxpayers.")

    if profile.is_govt_employee:
        govt_exclusion = any("government" in ex.lower() or "govt" in ex.lower() for ex in exclusions)
        if govt_exclusion:
            failed_criteria.append("Government Employee exclusion: Serving or retired govt personnel barred.")

    if profile.has_pension_above_10k:
        pension_exclusion = any("pension" in ex.lower() for ex in exclusions)
        if pension_exclusion:
            failed_criteria.append("Pension ceiling exclusion: Pension exceeds statutory threshold of ₹10,000/mo.")

    # -------------------------------------------------------------
    # 2. GENDER RESTRICTIONS
    # -------------------------------------------------------------
    required_gender = criteria.get("gender")
    if required_gender and required_gender.lower() not in ("all", "any"):
        if profile.gender:
            if profile.gender.strip().lower() == required_gender.lower():
                passed_criteria.append(f"Gender requirement met: {required_gender}")
            else:
                failed_criteria.append(f"Scheme restricted to {required_gender}; applicant is {profile.gender}")
        else:
            edge_case_flags.append(f"Scheme specifically targets {required_gender}; gender unconfirmed in profile.")

    # -------------------------------------------------------------
    # 3. AGE RESTRICTIONS
    # -------------------------------------------------------------
    min_age = criteria.get("min_age")
    max_age = criteria.get("max_age")
    if profile.age is not None:
        if min_age is not None and profile.age < min_age:
            failed_criteria.append(f"Applicant age ({profile.age}) is below minimum requirement ({min_age} years).")
        elif max_age is not None and profile.age > max_age:
            failed_criteria.append(f"Applicant age ({profile.age}) exceeds maximum ceiling ({max_age} years).")
        else:
            age_desc = []
            if min_age is not None:
                age_desc.append(f">={min_age}")
            if max_age is not None:
                age_desc.append(f"<={max_age}")
            passed_criteria.append(f"Age criteria met ({profile.age} yrs within {' and '.join(age_desc)}).")
    elif min_age is not None or max_age is not None:
        # Age omitted
        passed_criteria.append("Age requirement assumed subject to Aadhaar verification.")

    # -------------------------------------------------------------
    # 4. OCCUPATION MATCHING
    # -------------------------------------------------------------
    allowed_occupations = [o.lower() for o in criteria.get("occupations", ["any"])]
    if "any" not in allowed_occupations:
        user_occ = (profile.occupation or "").lower().strip()
        farmer_synonyms = ["farmer", "kisan", "krishi", "cultivator", "agriculture", "kheti", "agricultural labourer"]
        student_synonyms = ["student", "vidyarthi", "scholar", "chhatra"]
        artisan_synonyms = ["artisan", "karigar", "weaver", "carpenter", "tailor", "blacksmith", "handicraft"]

        is_farmer = any(s in user_occ for s in farmer_synonyms) or (profile.land_hectares is not None and profile.land_hectares > 0)
        is_student = any(s in user_occ for s in student_synonyms) or profile.is_student
        is_artisan = any(s in user_occ for s in artisan_synonyms)

        match_found = False
        for allowed in allowed_occupations:
            if "farmer" in allowed and is_farmer:
                match_found = True
                break
            if "student" in allowed and is_student:
                match_found = True
                break
            if ("artisan" in allowed or "self-employed" in allowed) and (is_artisan or "self" in user_occ or "business" in user_occ or "shop" in user_occ):
                match_found = True
                break
            if user_occ and (allowed in user_occ or user_occ in allowed):
                match_found = True
                break

        if match_found:
            passed_criteria.append(f"Occupation criterion met ({profile.occupation or 'Agricultural landholder'}).")
        elif not user_occ:
            edge_case_flags.append(f"Scheme targets {', '.join(criteria.get('occupations', []))}; occupation self-declaration needed.")
        else:
            failed_criteria.append(f"Occupation ({profile.occupation}) does not match scheme target: {', '.join(criteria.get('occupations', []))}.")

    # -------------------------------------------------------------
    # 5. LANDHOLDING REQUIREMENTS
    # -------------------------------------------------------------
    requires_land = criteria.get("requires_land_ownership", False)
    min_land = criteria.get("min_land_hectares")
    max_land = criteria.get("max_land_hectares")

    # Check for joint land or tenant farmer in special conditions
    special_conds_str = " ".join(profile.special_conditions).lower()
    has_joint_land = "joint" in special_conds_str or "ancestral" in special_conds_str or "khatauni" in special_conds_str
    is_tenant_farmer = "tenant" in special_conds_str or "sharecropper" in special_conds_str or "bataidar" in special_conds_str

    if requires_land:
        if profile.has_land_ownership is False:
            failed_criteria.append("Scheme mandates legal title to agricultural land. Profile indicates no land ownership.")
        elif profile.land_hectares is not None and profile.land_hectares <= 0:
            failed_criteria.append("Agricultural landholding must be greater than 0 hectares.")
        elif is_tenant_farmer and scheme.id == "pm_kisan":
            # PM-KISAN specifically excludes tenant farmers without title deed
            failed_criteria.append("PM-KISAN statutory rules exclude tenant farmers/sharecroppers without recorded ownership.")
        else:
            if has_joint_land:
                edge_case_flags.append("Joint land title / undivided ancestral Khatauni requires co-owner partition or affidavit.")
            passed_criteria.append("Land ownership requirement verified or declared.")

    if profile.land_hectares is not None:
        if min_land is not None and profile.land_hectares < min_land:
            failed_criteria.append(f"Landholding ({profile.land_hectares} ha) is below scheme minimum ({min_land} ha).")
        if max_land is not None:
            if profile.land_hectares > max_land:
                # Check borderline condition (within 10% margin of error)
                if profile.land_hectares <= max_land * 1.10:
                    edge_case_flags.append(
                        f"Landholding ({profile.land_hectares:.2f} ha) slightly exceeds {max_land} ha ceiling within 10% survey tolerance."
                    )
                else:
                    failed_criteria.append(
                        f"Landholding ({profile.land_hectares:.2f} ha) exceeds statutory ceiling of {max_land} ha."
                    )
            else:
                passed_criteria.append(f"Landholding ({profile.land_hectares:.2f} ha) is within permissible limit of {max_land} ha.")

    # -------------------------------------------------------------
    # 6. ANNUAL INCOME THRESHOLD
    # -------------------------------------------------------------
    max_income = criteria.get("max_annual_income_inr")
    if max_income is not None and profile.annual_income_inr is not None:
        if profile.annual_income_inr > max_income:
            # Check 10% edge case margin
            if profile.annual_income_inr <= max_income * 1.10:
                edge_case_flags.append(
                    f"Income (₹{profile.annual_income_inr:,}) is within 10% margin of ₹{max_income:,} threshold; net taxable vs gross deductions review required."
                )
            else:
                failed_criteria.append(
                    f"Annual income (₹{profile.annual_income_inr:,}) exceeds maximum ceiling of ₹{max_income:,}."
                )
        else:
            passed_criteria.append(f"Annual income (₹{profile.annual_income_inr:,}) complies with ceiling of ₹{max_income:,}.")

    # -------------------------------------------------------------
    # 7. HOUSING DWELLING TYPE
    # -------------------------------------------------------------
    housing_allowed = criteria.get("housing_type_allowed")
    if housing_allowed:
        user_housing = (profile.housing_type or "Pucca").strip()
        if user_housing.lower() in [h.lower() for h in housing_allowed]:
            passed_criteria.append(f"Housing dwelling status ({user_housing}) satisfies scheme criteria.")
        else:
            # If user has Pucca, PMAY-G is disqualified
            if "kutcha" in [h.lower() for h in housing_allowed] and user_housing.lower() == "pucca":
                failed_criteria.append("Scheme strictly requires Kutcha house or homelessness; applicant owns Pucca structure.")
            else:
                edge_case_flags.append(f"Housing status ({user_housing}) requires physical Gram Sabha verification.")

    # -------------------------------------------------------------
    # 8. SOCIAL CATEGORY
    # -------------------------------------------------------------
    allowed_categories = criteria.get("social_categories_allowed", ["All"])
    if "All" not in allowed_categories:
        user_cat = (profile.social_category or "").strip()
        if user_cat in allowed_categories:
            passed_criteria.append(f"Social category ({user_cat}) qualifies under reservation guidelines.")
        elif user_cat:
            failed_criteria.append(f"Category ({user_cat}) does not meet scheme requirements ({', '.join(allowed_categories)}).")
        else:
            edge_case_flags.append(f"Scheme requires category in {allowed_categories}; caste certificate verification needed.")

    # -------------------------------------------------------------
    # 9. STATE APPLICABILITY
    # -------------------------------------------------------------
    applicable_states = criteria.get("states_applicable", ["All"])
    if "All" not in applicable_states and profile.state:
        if profile.state.strip().lower() in [s.lower() for s in applicable_states]:
            passed_criteria.append(f"Applicant state ({profile.state}) is within operational jurisdiction.")
        else:
            failed_criteria.append(f"Scheme not applicable in state: {profile.state}.")

    # -------------------------------------------------------------
    # 10. DETERMINE FINAL STATUS (DETERMINISTIC INVARIANT)
    # -------------------------------------------------------------
    if len(failed_criteria) > 0:
        status = EligibilityStatus.NOT_ELIGIBLE
    elif len(edge_case_flags) > 0:
        status = EligibilityStatus.NEEDS_REVIEW
    else:
        status = EligibilityStatus.ELIGIBLE

    return SchemeEligibilityResult(
        scheme_id=scheme.id,
        scheme_name=scheme.name,
        scheme_name_hi=scheme.name_hi,
        category=scheme.category,
        status=status,
        benefit_amount_inr=scheme.benefit_amount_inr,
        benefit_description=scheme.benefit_description,
        benefit_frequency=scheme.benefit_frequency,
        passed_criteria=passed_criteria,
        failed_criteria=failed_criteria,
        edge_case_flags=edge_case_flags,
        required_documents=scheme.required_documents,
        portal_url=scheme.portal_url,
        application_mode=scheme.application_mode,
    )


def evaluate_all_schemes(
    profile: UserProfile,
    schemes: Optional[List[Scheme]] = None,
) -> Tuple[List[SchemeEligibilityResult], List[SchemeEligibilityResult], List[SchemeEligibilityResult]]:
    """Evaluate profile across all welfare schemes.
    
    Returns 3 sorted lists ranked by benefit_amount_inr descending:
      1. eligible_schemes
      2. review_schemes
      3. ineligible_schemes
    """
    if schemes is None:
        schemes = load_schemes_data()

    eligible: List[SchemeEligibilityResult] = []
    review: List[SchemeEligibilityResult] = []
    ineligible: List[SchemeEligibilityResult] = []

    for scheme in schemes:
        res = evaluate_single_scheme(profile, scheme)
        if res.status == EligibilityStatus.ELIGIBLE:
            eligible.append(res)
        elif res.status == EligibilityStatus.NEEDS_REVIEW:
            review.append(res)
        else:
            ineligible.append(res)

    # Sort descending by benefit value (₹)
    eligible.sort(key=lambda s: s.benefit_amount_inr, reverse=True)
    review.sort(key=lambda s: s.benefit_amount_inr, reverse=True)
    ineligible.sort(key=lambda s: s.benefit_amount_inr, reverse=True)

    return eligible, review, ineligible
