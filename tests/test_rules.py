"""Unit tests for deterministic rules engine in agent/rules.py.

Golden profiles tested:
(a) Ramesh: male, 40, farmer, Nashik, Maharashtra, income 150000, 1.5 acre land (convert), general -> PM-KISAN and KCC must be ELIGIBLE.
(b) Priya: female, 19, student, Pune, SC, family income 200000, undergraduate -> the scholarship scheme must be ELIGIBLE or LIKELY.
(c) Sunita: female, 32, homemaker, Bihar, BPL, no LPG connection -> Ujjwala must be ELIGIBLE.
(d) Salaried urban person with income 20 lakh must NOT be eligible for any of the 6 schemes.
"""

import pytest
from agent.models import CitizenProfile
from agent.rules import (
    acres_to_hectares,
    calc_benefits,
    evaluate_all,
    evaluate_scheme,
    load_schemes,
    rank_matches,
)


def test_acres_to_hectares():
    """Verify that 1 acre = 0.4047 ha, and 1.5 acres converts using 0.4047."""
    assert acres_to_hectares(1.0) == 0.4047
    assert acres_to_hectares(1.5) == round(1.5 * 0.4047, 4)
    assert acres_to_hectares(0) == 0.0


def test_golden_profile_ramesh():
    """Profile (a) Ramesh: male, 40, farmer, Nashik, Maharashtra, income 150000, 1.5 acre land, general.
    Must be ELIGIBLE for PM-KISAN and KCC.
    """
    profile = CitizenProfile(
        name="Ramesh",
        gender="male",
        age=40,
        occupation="farmer",
        district="Nashik",
        state="Maharashtra",
        annual_income_inr=150000,
        land_hectares=acres_to_hectares(1.5),
        caste_category="general",
    )

    schemes = load_schemes()
    matches = evaluate_all(profile, schemes)

    # Check PM-KISAN
    pm_kisan_match = next((m for m in matches if m.scheme_id == "PM_KISAN_2026"), None)
    assert pm_kisan_match is not None, "PM-KISAN scheme not found in matches"
    assert pm_kisan_match.status == "ELIGIBLE", f"Expected PM-KISAN to be ELIGIBLE, got {pm_kisan_match.status}. Reasons: {pm_kisan_match.reasons}"

    # Check KCC
    kcc_match = next((m for m in matches if m.scheme_id == "KCC_2026"), None)
    assert kcc_match is not None, "KCC scheme not found in matches"
    assert kcc_match.status == "ELIGIBLE", f"Expected KCC to be ELIGIBLE, got {kcc_match.status}. Reasons: {kcc_match.reasons}"

    # Verify ranking and benefits
    total_benefit = calc_benefits(matches)
    assert total_benefit >= 306000
    assert pm_kisan_match.priority_rank is not None
    assert kcc_match.priority_rank is not None


def test_golden_profile_priya():
    """Profile (b) Priya: female, 19, student, Pune, SC, family income 200000, undergraduate.
    The scholarship scheme must be ELIGIBLE or LIKELY.
    """
    profile = CitizenProfile(
        name="Priya",
        gender="female",
        age=19,
        occupation="student",
        district="Pune",
        state="Maharashtra",
        caste_category="sc",
        annual_income_inr=200000,
        education_level="undergraduate",
    )

    schemes = load_schemes()
    matches = evaluate_all(profile, schemes)

    scholarship_match = next((m for m in matches if m.scheme_id == "NSP_POST_MATRIC_SC_2026"), None)
    assert scholarship_match is not None, "Scholarship scheme not found in matches"
    assert scholarship_match.status in ("ELIGIBLE", "LIKELY"), (
        f"Expected Scholarship scheme to be ELIGIBLE or LIKELY, got {scholarship_match.status}. Reasons: {scholarship_match.reasons}"
    )
    assert scholarship_match.annual_benefit_inr == 48000


def test_golden_profile_sunita():
    """Profile (c) Sunita: female, 32, homemaker, Bihar, BPL, no LPG connection.
    Ujjwala must be ELIGIBLE.
    """
    profile = CitizenProfile(
        name="Sunita",
        gender="female",
        age=32,
        occupation="homemaker",
        state="Bihar",
        is_bpl=True,
        has_lpg_connection=False,
    )

    schemes = load_schemes()
    matches = evaluate_all(profile, schemes)

    ujjwala_match = next((m for m in matches if m.scheme_id == "PM_UJJWALA_2_2026"), None)
    assert ujjwala_match is not None, "Ujjwala scheme not found in matches"
    assert ujjwala_match.status == "ELIGIBLE", (
        f"Expected Ujjwala to be ELIGIBLE, got {ujjwala_match.status}. Reasons: {ujjwala_match.reasons}"
    )
    assert ujjwala_match.annual_benefit_inr > 0


def test_negative_salaried_urban_person():
    """Negative test: a salaried urban person with income 20 lakh must NOT be eligible for any of the 6 schemes."""
    profile = CitizenProfile(
        name="Vikram",
        gender="male",
        age=35,
        occupation="other",  # salaried IT professional
        district="Bengaluru",
        state="Karnataka",
        annual_income_inr=2000000,  # 20 Lakhs
        land_hectares=0.0,
        has_pucca_house=True,
        has_lpg_connection=True,
        is_bpl=False,
        caste_category="general",
        is_taxpayer=True,
    )

    schemes = load_schemes()
    matches = evaluate_all(profile, schemes)

    assert len(matches) == 6
    for m in matches:
        assert m.status == "NOT_ELIGIBLE", (
            f"Expected {m.scheme_id} to be NOT_ELIGIBLE for 20L salaried person, got {m.status}. Reasons: {m.reasons}"
        )

    # Benefit sum for ineligible person must be 0
    total_benefit = calc_benefits(matches)
    assert total_benefit == 0
