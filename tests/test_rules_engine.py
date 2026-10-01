"""Unit tests for deterministic welfare rules engine and eligibility invariants.

RULES TESTED:
- Deterministic decisions reading data/schemes_data.json
- Money = integer INR
- Land = hectares (1 acre = 0.4047 ha)
- LLM or reviewer NEVER flips NOT_ELIGIBLE to ELIGIBLE
- Schemes ranked by benefit_amount_inr descending
"""

import pytest
from agent.edge_case_reviewer import review_flagged_edge_case
from agent.models import (
    ACRES_TO_HECTARES,
    EligibilityStatus,
    Scheme,
    SchemeEligibilityResult,
    UserProfile,
)
from agent.rules_engine import (
    evaluate_all_schemes,
    evaluate_single_scheme,
    load_schemes_data,
)


def test_land_unit_conversion():
    """Verify that 1 acre converts precisely to 0.4047 hectares."""
    profile = UserProfile(land_acres=1.0)
    assert profile.land_hectares == 0.4047

    profile2 = UserProfile(land_acres=2.5)
    assert round(profile2.land_hectares, 4) == round(2.5 * 0.4047, 4)

    profile3 = UserProfile(land_hectares=0.8094)
    assert profile3.land_acres == 2.0


def test_pm_kisan_eligible_farmer():
    """A smallholder farmer with cultivable land and no disqualifications must be ELIGIBLE."""
    profile = UserProfile(
        age=38,
        occupation="Farmer",
        land_acres=3.0,
        annual_income_inr=90000,
        is_taxpayer=False,
        is_govt_employee=False,
    )
    schemes = load_schemes_data()
    pm_kisan = next(s for s in schemes if s.id == "pm_kisan")
    result = evaluate_single_scheme(profile, pm_kisan)

    assert result.status == EligibilityStatus.ELIGIBLE
    assert result.benefit_amount_inr == 6000
    assert len(result.failed_criteria) == 0


def test_pm_kisan_taxpayer_disqualification():
    """An income-taxpayer farmer is strictly disqualified under statutory rules."""
    profile = UserProfile(
        age=40,
        occupation="Farmer",
        land_acres=2.0,
        annual_income_inr=600000,
        is_taxpayer=True,  # Disqualification trigger
    )
    schemes = load_schemes_data()
    pm_kisan = next(s for s in schemes if s.id == "pm_kisan")
    result = evaluate_single_scheme(profile, pm_kisan)

    assert result.status == EligibilityStatus.NOT_ELIGIBLE
    assert any("tax" in f.lower() for f in result.failed_criteria)


def test_pmay_g_housing_criteria():
    """PMAY-G requires Kutcha house; an applicant owning a Pucca house is NOT_ELIGIBLE."""
    profile_kutcha = UserProfile(
        age=32,
        housing_type="Kutcha",
        annual_income_inr=80000,
    )
    profile_pucca = UserProfile(
        age=32,
        housing_type="Pucca",
        annual_income_inr=80000,
    )
    schemes = load_schemes_data()
    pmay = next(s for s in schemes if s.id == "pmay_g")

    res_kutcha = evaluate_single_scheme(profile_kutcha, pmay)
    assert res_kutcha.status == EligibilityStatus.ELIGIBLE
    assert res_kutcha.benefit_amount_inr == 120000

    res_pucca = evaluate_single_scheme(profile_pucca, pmay)
    assert res_pucca.status == EligibilityStatus.NOT_ELIGIBLE
    assert any("pucca" in f.lower() for f in res_pucca.failed_criteria)


def test_ayushman_bharat_income_ceiling():
    """Ayushman Bharat covers low-income families below ₹2,50,000."""
    schemes = load_schemes_data()
    ayushman = next(s for s in schemes if s.id == "ayushman_bharat")

    profile_eligible = UserProfile(
        age=45,
        annual_income_inr=150000,
        housing_type="Kutcha",
    )
    res_eligible = evaluate_single_scheme(profile_eligible, ayushman)
    assert res_eligible.status == EligibilityStatus.ELIGIBLE
    assert res_eligible.benefit_amount_inr == 500000

    profile_high_income = UserProfile(
        age=45,
        annual_income_inr=400000,
        housing_type="Pucca",
    )
    res_high = evaluate_single_scheme(profile_high_income, ayushman)
    assert res_high.status == EligibilityStatus.NOT_ELIGIBLE


def test_invariant_never_flip_not_eligible_to_eligible():
    """CRITICAL RULE: The LLM/reviewer MUST NEVER flip NOT_ELIGIBLE to ELIGIBLE."""
    profile = UserProfile(
        age=35,
        occupation="Farmer",
        is_taxpayer=True,  # Disqualified for PM-KISAN
    )
    schemes = load_schemes_data()
    pm_kisan = next(s for s in schemes if s.id == "pm_kisan")
    result = evaluate_single_scheme(profile, pm_kisan)

    assert result.status == EligibilityStatus.NOT_ELIGIBLE

    # Try passing NOT_ELIGIBLE through the edge case reviewer
    reviewed = review_flagged_edge_case(result, profile)
    assert reviewed.status == EligibilityStatus.NOT_ELIGIBLE, "CRITICAL ERROR: Reviewer flipped NOT_ELIGIBLE!"


def test_edge_case_flagging_joint_land():
    """Joint land title should flag NEEDS_REVIEW with actionable verification procedure."""
    profile = UserProfile(
        age=42,
        occupation="Farmer",
        land_acres=2.0,
        special_conditions=["joint land ownership / undivided Khatauni"],
    )
    schemes = load_schemes_data()
    pm_kisan = next(s for s in schemes if s.id == "pm_kisan")
    result = evaluate_single_scheme(profile, pm_kisan)

    assert result.status == EligibilityStatus.NEEDS_REVIEW
    assert any("joint" in f.lower() for f in result.edge_case_flags)

    # Edge review provides guidance without flipping to NOT_ELIGIBLE
    reviewed = review_flagged_edge_case(result, profile)
    assert reviewed.status == EligibilityStatus.NEEDS_REVIEW
    assert reviewed.llm_edge_review is not None


def test_ranking_by_benefit_amount():
    """Schemes must be sorted by benefit_amount_inr in descending order."""
    profile = UserProfile(
        age=30,
        occupation="Farmer",
        land_acres=2.0,
        annual_income_inr=100000,
        housing_type="Kutcha",
    )
    eligible, review, ineligible = evaluate_all_schemes(profile)

    assert len(eligible) > 0
    # Check descending order of benefit amounts
    amounts = [s.benefit_amount_inr for s in eligible]
    assert amounts == sorted(amounts, reverse=True)
