"""End-to-end integration tests for SchemeSetu Bharat agent execution.

Tests:
1. Ramesh Hinglish sentence -> PM-KISAN, KCC eligible; PDF generated; validate_result == []
2. Marathi sentence for Pune SC student -> NSP Post-Matric SC eligible; PDF generated; validate_result == []
3. Hindi sentence for Sunita from Bihar -> PM Ujjwala 2.0, PMAY-G eligible; PDF generated; validate_result == []
4. Guardrail validation integrity test -> negative assertions trigger descriptive problems

Mocks nothing; allows env flag SKIP_E2E_WHEN_NO_KEY to skip tests when GEMINI_API_KEY is absent.
"""

import os
from pathlib import Path
import pytest

from agent.agent import run_agent
from agent.guardrails import validate_result
from agent.models import AgentResult, CitizenProfile, SchemeMatch
from agent import rules

# Allow env flag to skip when GEMINI_API_KEY is absent
SKIP_FLAG = os.getenv("SKIP_E2E_WHEN_NO_KEY", "").lower() in ("1", "true", "yes") or os.getenv("SKIP_WHEN_NO_KEY", "").lower() in ("1", "true", "yes")
KEY_ABSENT = not os.getenv("GEMINI_API_KEY", "").strip()

if SKIP_FLAG and KEY_ABSENT:
    pytestmark = pytest.mark.skip(reason="GEMINI_API_KEY is absent and SKIP_E2E_WHEN_NO_KEY is set")


def test_e2e_ramesh_hinglish():
    """Test full agent loop with Ramesh Hinglish query."""
    query = (
        "bhai mera naam ramesh hai age around 40 years.. nashik maharashtra se hu "
        "kheti kisan ka kaam karta hu 1.5 acre land hai aur saal bhar me lagbhag dedh lakh (1.5L) kamai ho jati hai"
    )

    result = run_agent(query, language="hi")

    # Assert basic result structure
    assert isinstance(result, AgentResult)
    assert result.profile is not None
    assert result.profile.occupation.lower() == "farmer"

    # Assert expected ELIGIBLE schemes
    eligible_ids = {m.scheme_id for m in result.matches if m.status == "ELIGIBLE"}
    assert "PM_KISAN_2026" in eligible_ids, f"Expected PM_KISAN_2026 to be ELIGIBLE, got {eligible_ids}"
    assert "KCC_2026" in eligible_ids, f"Expected KCC_2026 to be ELIGIBLE, got {eligible_ids}"

    # PMAY-G is not eligible because kutcha house is not mentioned
    assert "PMAY_G_2026" not in eligible_ids
    assert "NSP_POST_MATRIC_SC_2026" not in eligible_ids
    assert "PM_UJJWALA_2_2026" not in eligible_ids

    # Assert PDF exists and is non-empty
    assert result.pdf_path is not None, "Action pack PDF path should not be None"
    pdf_file = Path(result.pdf_path)
    assert pdf_file.exists(), f"PDF file does not exist at {result.pdf_path}"
    assert pdf_file.stat().st_size > 0, "PDF file is empty"

    # Assert validate_result returns no problems
    problems = validate_result(result)
    assert problems == [], f"Guardrail validation reported problems: {problems}"


def test_e2e_pune_sc_student_marathi():
    """Test full agent loop with Pune SC student Marathi query."""
    query = (
        "मी पुण्याचा अनुसूचित जातीचा विद्यार्थी आहे. माझे वय 20 वर्षे आहे. "
        "मी पदवीचे शिक्षण घेत आहे आणि आमच्या कुटुंबाचे वार्षिक उत्पन्न 1 लाख रुपये आहे."
    )

    result = run_agent(query, language="mr")

    # Assert basic result structure
    assert isinstance(result, AgentResult)
    assert result.profile is not None
    assert result.profile.occupation.lower() == "student"

    # Assert expected ELIGIBLE schemes
    eligible_ids = {m.scheme_id for m in result.matches if m.status == "ELIGIBLE"}
    assert "NSP_POST_MATRIC_SC_2026" in eligible_ids, f"Expected NSP_POST_MATRIC_SC_2026 to be ELIGIBLE, got {eligible_ids}"
    assert "PM_KISAN_2026" not in eligible_ids
    assert "KCC_2026" not in eligible_ids

    # Assert PDF exists and is non-empty
    assert result.pdf_path is not None, "Action pack PDF path should not be None"
    pdf_file = Path(result.pdf_path)
    assert pdf_file.exists(), f"PDF file does not exist at {result.pdf_path}"
    assert pdf_file.stat().st_size > 0, "PDF file is empty"

    # Assert validate_result returns no problems
    problems = validate_result(result)
    assert problems == [], f"Guardrail validation reported problems: {problems}"


def test_e2e_sunita_bihar_hindi():
    """Test full agent loop with Sunita from Bihar Hindi query."""
    query = (
        "मैं सुनीता हूँ, बिहार से। उम्र 35 वर्ष। बीपीएल परिवार, कच्चा घर, "
        "और हमारे पास कोई एलपीजी गैस कनेक्शन नहीं है। आय 40,000 रुपये है।"
    )

    result = run_agent(query, language="hi")

    # Assert basic result structure
    assert isinstance(result, AgentResult)
    assert result.profile is not None
    assert result.profile.is_bpl is True

    # Assert expected ELIGIBLE schemes
    eligible_ids = {m.scheme_id for m in result.matches if m.status == "ELIGIBLE"}
    assert "PM_UJJWALA_2_2026" in eligible_ids, f"Expected PM_UJJWALA_2_2026 to be ELIGIBLE, got {eligible_ids}"
    assert "PMAY_G_2026" in eligible_ids, f"Expected PMAY_G_2026 to be ELIGIBLE, got {eligible_ids}"
    assert "PM_KISAN_2026" not in eligible_ids
    assert "KCC_2026" not in eligible_ids

    # Assert PDF exists and is non-empty
    assert result.pdf_path is not None, "Action pack PDF path should not be None"
    pdf_file = Path(result.pdf_path)
    assert pdf_file.exists(), f"PDF file does not exist at {result.pdf_path}"
    assert pdf_file.stat().st_size > 0, "PDF file is empty"

    # Assert validate_result returns no problems
    problems = validate_result(result)
    assert problems == [], f"Guardrail validation reported problems: {problems}"


def test_guardrails_detect_violations():
    """Verify that validate_result detects violations across all 4 invariant checks."""
    all_schemes = rules.load_schemes()
    profile = CitizenProfile(age=30, has_pucca_house=True)
    matches = rules.evaluate_all(profile)
    valid_total = sum(m.annual_benefit_inr for m in matches if m.status in ("ELIGIBLE", "LIKELY"))

    # Check (a): Fake scheme_id
    bad_id_res = AgentResult(
        profile=profile,
        matches=[SchemeMatch(scheme_id="INVALID_SCHEME_XYZ", status="ELIGIBLE", annual_benefit_inr=5000)],
        total_annual_benefit_inr=5000,
    )
    p_a = validate_result(bad_id_res)
    assert any("does not exist in data/schemes_data.json" in p for p in p_a)

    # Check (b): Disqualified scheme marked ELIGIBLE
    # PMAY-G strictly forbids pucca houses; profile has pucca house
    pmay_scheme = next(s for s in all_schemes if s.get("scheme_id") == "PMAY_G_2026")
    bad_elig_match = SchemeMatch(
        scheme_id="PMAY_G_2026",
        status="ELIGIBLE",
        annual_benefit_inr=120000,
        required_documents=pmay_scheme.get("required_documents", []),
    )
    bad_elig_res = AgentResult(
        profile=profile,
        matches=[bad_elig_match],
        total_annual_benefit_inr=120000,
    )
    p_b = validate_result(bad_elig_res)
    assert any("failed deterministic re-evaluation" in p for p in p_b)

    # Check (c): Mismatched benefit sum
    wrong_sum_res = AgentResult(
        profile=profile,
        matches=matches,
        total_annual_benefit_inr=valid_total + 10000,
    )
    p_c = validate_result(wrong_sum_res)
    assert any("total_annual_benefit_inr" in p for p in p_c)

    # Check (d): Altered required_documents
    pmkisan_scheme = next(s for s in all_schemes if s.get("scheme_id") == "PM_KISAN_2026")
    bad_docs_match = SchemeMatch(
        scheme_id="PM_KISAN_2026",
        status="NEEDS_INFO",
        annual_benefit_inr=6000,
        required_documents=["Fake Document Unauthorized"],
    )
    bad_docs_res = AgentResult(
        profile=profile,
        matches=[bad_docs_match],
        total_annual_benefit_inr=0,
    )
    p_d = validate_result(bad_docs_res)
    assert any("required_documents" in p for p in p_d)
