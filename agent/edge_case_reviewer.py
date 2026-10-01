"""LLM Edge Case Reviewer module.

MANDATORY RULES:
1. The LLM may ONLY review edge cases that the deterministic rules flagged (status == NEEDS_REVIEW).
2. It MUST NEVER invent scheme facts.
3. It MUST NEVER flip NOT_ELIGIBLE to ELIGIBLE.
"""

from typing import List, Optional
from agent.gemini_client import call_gemini
from agent.models import EligibilityStatus, SchemeEligibilityResult, UserProfile


EDGE_REVIEW_SYSTEM_PROMPT = """You are an official welfare compliance reviewer for the Government of India.
You are evaluating a welfare scheme application flagged by deterministic rules for an EDGE CASE (e.g., joint landholding, borderline threshold, missing certificate).

STRICT COMPLIANCE INVARIANTS:
1. You CANNOT overturn statutory rules or exclusions.
2. You CANNOT invent scheme rules or benefits.
3. You CANNOT certify an applicant as definitively ELIGIBLE if mandatory documentation is absent.
4. Provide a clear, actionable 2-3 sentence administrative guidance note explaining:
   - What the edge case implies.
   - Which specific administrative certificate or affidavit (e.g. Patwari/Lekhpal Panchnama, Tahsildar Income Certificate, Co-owner NOC) is required to resolve it at the CSC or Tehsil.
"""


def generate_fallback_edge_review(scheme_name: str, edge_flags: List[str]) -> str:
    """Deterministic administrative guidance for flagged edge cases."""
    guidance_notes = []
    flags_text = " ".join(edge_flags).lower()

    if "joint" in flags_text or "khatauni" in flags_text:
        guidance_notes.append(
            "संयुक्त भूमि (Joint Landholding): ग्राम लेखपाल/पटवारी से सह-खातेदार अनापत्ति प्रमाण पत्र (NOC Affidavit) एवं अलग अंश निर्धारण अनिवार्य है।"
        )
    if "tolerance" in flags_text or "landholding" in flags_text:
        guidance_notes.append(
            "सीमांत भूमि सत्यापन (Land Boundary): खतौनी में दर्ज रकबा योजना की सीमा से अत्यंत निकट है; तहसील से प्रमाणित खसरा नकल प्रस्तुत करें।"
        )
    if "income" in flags_text or "taxable" in flags_text:
        guidance_notes.append(
            "आय सत्यापन (Income Threshold): सकल आय सीमा के निकट है; तहसीलदार द्वारा जारी वैध आय प्रमाण पत्र (Income Certificate) संलग्न करना होगा।"
        )
    if "gender" in flags_text or "occupation" in flags_text or "caste" in flags_text:
        guidance_notes.append(
            "दस्तावेज़ सत्यापन (Verification Required): संबंधित पात्रता श्रेणी के लिए स्व-घोषणा पत्र एवं अधिकृत पहचान पत्र अनिवार्य है।"
        )

    if not guidance_notes:
        guidance_notes.append(
            f"यह आवेदन '{scheme_name}' की विशेष शर्तों के अधीन है। कृपया सीएससी (CSC) केंद्र पर मूल दस्तावेजों के साथ भौतिक सत्यापन कराएं।"
        )

    return " | ".join(guidance_notes)


def review_flagged_edge_case(result: SchemeEligibilityResult, profile: UserProfile) -> SchemeEligibilityResult:
    """Review an edge-case flagged scheme.
    
    INVARIANT: Cannot be called on NOT_ELIGIBLE results. Never flips NOT_ELIGIBLE to ELIGIBLE.
    """
    if result.status == EligibilityStatus.NOT_ELIGIBLE:
        # Strict guardrail: Do not touch NOT_ELIGIBLE results
        return result

    if result.status != EligibilityStatus.NEEDS_REVIEW or not result.edge_case_flags:
        return result

    flags_summary = "\n- ".join(result.edge_case_flags)
    prompt = (
        f"Scheme: {result.scheme_name}\n"
        f"Applicant Profile Summary: Age={profile.age}, Occupation={profile.occupation}, "
        f"Land={profile.land_hectares} ha ({profile.land_acres} acres), Income=₹{profile.annual_income_inr}\n"
        f"Flagged Edge Cases:\n- {flags_summary}\n\n"
        f"Please provide the official administrative review note and document resolution steps."
    )

    llm_review = call_gemini(prompt=prompt, system_instruction=EDGE_REVIEW_SYSTEM_PROMPT)

    if not llm_review or len(llm_review.strip()) < 10:
        result.llm_edge_review = generate_fallback_edge_review(result.scheme_name, result.edge_case_flags)
    else:
        result.llm_edge_review = llm_review.strip()

    # Invariant: status remains NEEDS_REVIEW; rules engine is the final decider
    return result


def review_all_edge_cases(
    review_schemes: List[SchemeEligibilityResult],
    profile: UserProfile,
) -> List[SchemeEligibilityResult]:
    """Iterate through all flagged edge-case schemes and enrich them with compliance reviews."""
    updated: List[SchemeEligibilityResult] = []
    for res in review_schemes:
        updated.append(review_flagged_edge_case(res, profile))
    return updated
