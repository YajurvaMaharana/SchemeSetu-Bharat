"""Citizen-friendly explanation generator for SchemeSetu Bharat.

MANDATORY RULES:
1. Write empathetic, clear, jargon-free explanations in Hindi or English.
2. Must never invent scheme facts or promised benefits outside schemes_data.json.
3. Clearly list required documents and step-by-step next actions.
"""

from typing import Dict, List, Optional
from agent.gemini_client import call_gemini
from agent.models import SchemeEligibilityResult, UserProfile


EXPLAINER_SYSTEM_PROMPT = """You are 'SchemeSetu', an empathetic, highly knowledgeable welfare advisor for Indian citizens.
Your job is to explain the welfare benefits they qualify for in simple, respectful language (Hindi or English).

RULES:
1. Do NOT invent new schemes or benefits. Use ONLY the schemes, benefits, and documents passed in the context.
2. Highlight total financial value unlocked in Indian Rupees (₹).
3. Clearly list what physical documents the citizen must take to the nearest CSC center or bank.
4. Keep the tone warm, empowering, and easy to understand for rural or low-literacy citizens.
"""


def generate_fallback_summary(
    profile: UserProfile,
    eligible: List[SchemeEligibilityResult],
    review: List[SchemeEligibilityResult],
) -> str:
    """Deterministic, structured summary in simple Hindi / English."""
    total_benefit = sum(s.benefit_amount_inr for s in eligible)
    eligible_names = [s.scheme_name_hi or s.scheme_name for s in eligible]
    review_names = [s.scheme_name_hi or s.scheme_name for s in review]

    lines = []
    lines.append(f"🙏 नमस्ते! आपकी पात्रता के विश्लेषण के अनुसार:")
    lines.append(f"• कुल संभावित सरकारी लाभ: ₹{total_benefit:,} तक")
    lines.append(f"• तुरंत पात्र योजनाएं ({len(eligible)}): {', '.join(eligible_names) if eligible_names else 'कोई नहीं'}")

    if review:
        lines.append(f"• सत्यापन के अधीन योजनाएं ({len(review)}): {', '.join(review_names)}")
        lines.append("  (इन योजनाओं के लिए तहसील या सीएससी केंद्र पर अतिरिक्त दस्तावेज़ जैसे खतौनी/आय प्रमाण पत्र की आवश्यकता होगी।)")

    lines.append("\n📋 आवश्यक मुख्य दस्तावेज़:")
    all_docs = set()
    for s in eligible + review:
        all_docs.update(s.required_documents[:2])
    for doc in sorted(list(all_docs))[:5]:
        lines.append(f"  ✓ {doc}")

    lines.append("\n👉 अगला कदम: नजदीकी कॉमन सर्विस सेंटर (CSC) पर जाएं या ऑनलाइन पोर्टल के माध्यम से आवेदन करें।")
    return "\n".join(lines)


def generate_explanations(
    profile: UserProfile,
    eligible: List[SchemeEligibilityResult],
    review: List[SchemeEligibilityResult],
) -> str:
    """Generate citizen-facing summary and explanations using Gemini with deterministic fallback."""
    total_benefit = sum(s.benefit_amount_inr for s in eligible)

    schemes_context = []
    for s in eligible:
        schemes_context.append(
            f"[ELIGIBLE] {s.scheme_name} (Benefit: ₹{s.benefit_amount_inr:,} - {s.benefit_description})\n"
            f"Required Docs: {', '.join(s.required_documents)}"
        )
    for s in review:
        schemes_context.append(
            f"[NEEDS_REVIEW] {s.scheme_name} (Benefit: ₹{s.benefit_amount_inr:,})\n"
            f"Edge Case Note: {s.llm_edge_review or ', '.join(s.edge_case_flags)}"
        )

    context_str = "\n".join(schemes_context)
    prompt = (
        f"Citizen Profile: Age={profile.age}, Occupation={profile.occupation}, "
        f"Income=₹{profile.annual_income_inr}, Land={profile.land_hectares} ha ({profile.land_acres} acres), "
        f"State={profile.state}, Preferred Language={profile.preferred_language}\n\n"
        f"Total Financial Value: ₹{total_benefit:,}\n\n"
        f"Welfare Schemes Evaluated:\n{context_str}\n\n"
        f"Write a friendly, empowering summary in {profile.preferred_language} outlining eligible schemes, "
        f"total benefit, key documents, and next steps."
    )

    llm_summary = call_gemini(prompt=prompt, system_instruction=EXPLAINER_SYSTEM_PROMPT)

    if llm_summary and len(llm_summary.strip()) > 30:
        return llm_summary.strip()

    return generate_fallback_summary(profile, eligible, review)
