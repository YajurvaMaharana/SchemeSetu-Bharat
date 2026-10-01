"""LLM integration module for SchemeSetu Bharat using the modern google-genai SDK.

RULES:
- Read GEMINI_API_KEY and GEMINI_MODEL from the environment using python-dotenv.
- Use the google-genai SDK (from google import genai), not the deprecated google-generativeai.
- Deterministic rules govern statutory eligibility; LLM only extracts profiles,
  reviews rule-flagged edge cases, and composes plain explanations.
- Never declare a scheme eligible if a hard rule failed.
"""

import json
import logging
import os
import time
from typing import Any, Dict, Optional, Union
from dotenv import load_dotenv
from google import genai
from google.genai import types

from agent.models import CitizenProfile, SchemeMatch
from agent.profile_extractor import heuristic_extract_profile

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()

SYSTEM_EXTRACTION_INSTRUCTION = (
    "Extract only facts explicitly stated; unknown fields stay null; "
    "understand Hindi (Devanagari and Hinglish), Marathi and English; "
    "convert lakh/crore amounts to integer rupees ('1.5 lakh' = 150000); "
    "convert acre to hectares (x 0.4047); if land is given in bigha, guna or other "
    "local units, leave land_hectares null; infer occupation from words like "
    "kisan/shetkari (farmer), vidyarthi (student)."
)


def get_genai_client(timeout_secs: float = 20.0) -> Optional[genai.Client]:
    """Initialize and return a google-genai Client with the configured timeout."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip() or GEMINI_API_KEY
    if not api_key:
        logger.warning("GEMINI_API_KEY is not set in environment or .env.")
        return None

    try:
        http_options = types.HttpOptions(timeout=int(timeout_secs * 1000))
        return genai.Client(api_key=api_key, http_options=http_options)
    except Exception as e:
        logger.error(f"Failed to initialize google-genai Client: {e}")
        return None


def call_gemini(
    prompt: str,
    system_instruction: Optional[str] = None,
    response_schema: Optional[Any] = None,
    response_mime_type: Optional[str] = None,
    temperature: float = 0.0,
    timeout_secs: float = 20.0,
    max_retries: int = 2,
    backoff_secs: float = 1.0,
) -> Any:
    """Helper to execute Gemini generate_content with timeout, retries, and logging."""
    client = get_genai_client(timeout_secs=timeout_secs)
    if client is None:
        raise RuntimeError("Gemini client is not available. Please verify GEMINI_API_KEY.")

    model_name = os.getenv("GEMINI_MODEL", "").strip() or GEMINI_MODEL

    config_kwargs: Dict[str, Any] = {
        "temperature": temperature,
    }
    if system_instruction:
        config_kwargs["system_instruction"] = system_instruction
    if response_mime_type:
        config_kwargs["response_mime_type"] = response_mime_type
    if response_schema:
        config_kwargs["response_schema"] = response_schema

    config = types.GenerateContentConfig(**config_kwargs)

    last_error: Optional[Exception] = None
    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Calling Gemini model '{model_name}' (attempt {attempt}/{max_retries})...")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config,
            )
            return response
        except Exception as e:
            last_error = e
            logger.warning(
                f"Gemini call attempt {attempt}/{max_retries} failed with error: {e}. "
                f"Backing off for {backoff_secs}s..."
            )
            if attempt < max_retries:
                time.sleep(backoff_secs * attempt)

    logger.error(f"All {max_retries} attempts to call Gemini failed: {last_error}")
    raise RuntimeError(f"Gemini API call failed after {max_retries} retries: {last_error}") from last_error


def extract_profile(text: str, language: str = "hi") -> CitizenProfile:
    """Extract structured CitizenProfile from citizen query using Gemini.
    
    Uses response_mime_type='application/json' and response_schema=CitizenProfile.
    Retries once on parse failure; on second failure returns an empty CitizenProfile
    and logs a clear exception message.
    """
    if not text or not text.strip():
        return CitizenProfile()

    # Retry once on parse failure (2 total attempts)
    max_attempts = 2
    last_exception: Optional[Exception] = None

    for attempt in range(1, max_attempts + 1):
        try:
            resp = call_gemini(
                prompt=f"Citizen Input Text ({language}):\n{text}",
                system_instruction=SYSTEM_EXTRACTION_INSTRUCTION,
                response_schema=CitizenProfile,
                response_mime_type="application/json",
                temperature=0.0,
                timeout_secs=20.0,
                max_retries=1,  # Retries handled explicitly here
            )

            # Handle response parsing
            if hasattr(resp, "parsed") and isinstance(resp.parsed, CitizenProfile):
                return resp.parsed
            elif hasattr(resp, "parsed") and isinstance(resp.parsed, dict):
                return CitizenProfile(**resp.parsed)
            elif hasattr(resp, "text") and resp.text:
                data = json.loads(resp.text)
                return CitizenProfile(**data)
            else:
                raise ValueError(f"Empty or unparseable response from Gemini: {resp}")

        except Exception as e:
            last_exception = e
            logger.warning(f"Profile extraction parse attempt {attempt}/{max_attempts} failed: {e}")
            if attempt < max_attempts:
                time.sleep(1.0)

    # On second failure, log clear exception message and return empty CitizenProfile
    error_msg = f"Profile extraction failed on second attempt. Query: '{text[:80]}...'. Error: {last_exception}"
    logger.error(error_msg, exc_info=True)

    # For offline/stub fallback during demos without crashing:
    try:
        fallback_profile = heuristic_extract_profile(text)
        if fallback_profile and (fallback_profile.age or fallback_profile.occupation or fallback_profile.annual_income_inr):
            logger.info("Using resilient heuristic extraction fallback for profile.")
            return fallback_profile
    except Exception as fb_err:
        logger.warning(f"Heuristic fallback failed: {fb_err}")

    return CitizenProfile()


def review_edge_case(
    profile: Union[CitizenProfile, Dict[str, Any]],
    scheme: Dict[str, Any],
    rule_match: SchemeMatch,
) -> Dict[str, str]:
    """Review borderline criteria or missing information for a welfare scheme.
    
    Called ONLY for LIKELY or NEEDS_INFO matches.
    Strict Invariant: LLM may NOT declare a scheme eligible if a hard rule failed.
    Returns: {"verdict": "ELIGIBLE" | "LIKELY" | "NEEDS_INFO", "reason": "<one sentence>"}
    """
    # Strict boundary guardrail: Never review NOT_ELIGIBLE or already ELIGIBLE
    if rule_match.status == "NOT_ELIGIBLE":
        return {
            "verdict": "NOT_ELIGIBLE",
            "reason": "Hard statutory rule failed; eligibility cannot be granted.",
        }
    if rule_match.status == "ELIGIBLE":
        return {
            "verdict": "ELIGIBLE",
            "reason": rule_match.reasons[0] if rule_match.reasons else "All statutory criteria satisfied.",
        }

    profile_dict = profile.model_dump() if hasattr(profile, "model_dump") else dict(profile)
    scheme_name = scheme.get("name") or scheme.get("short_name", "")
    scheme_id = scheme.get("scheme_id") or scheme.get("id", "")

    prompt = (
        f"You are the senior welfare adjudicator for SchemeSetu Bharat.\n"
        f"Review the following edge case or missing information for welfare scheme '{scheme_name}' ({scheme_id}).\n\n"
        f"CRITICAL CONSTRAINT:\n"
        f"You may NOT declare a scheme eligible if a hard rule failed; base your reasoning only on the scheme JSON provided.\n"
        f"If mandatory documents or qualifications are missing, set verdict to 'NEEDS_INFO'.\n"
        f"If the criterion is satisfied or within administrative survey tolerance, you may return 'LIKELY' or 'ELIGIBLE'.\n\n"
        f"Scheme Definition:\n{json.dumps(scheme, ensure_ascii=False, indent=2)}\n\n"
        f"Citizen Profile:\n{json.dumps(profile_dict, ensure_ascii=False, indent=2)}\n\n"
        f"Deterministic Rule Engine Status: {rule_match.status}\n"
        f"Deterministic Reasons: {rule_match.reasons}\n"
        f"Missing Info: {rule_match.missing_info}\n\n"
        f"Respond ONLY in valid JSON matching this schema:\n"
        f'{{"verdict": "ELIGIBLE" | "LIKELY" | "NEEDS_INFO", "reason": "one concise sentence"}}'
    )

    try:
        resp = call_gemini(
            prompt=prompt,
            response_mime_type="application/json",
            temperature=0.0,
            timeout_secs=20.0,
            max_retries=2,
        )
        data = json.loads(resp.text)
        verdict = str(data.get("verdict", rule_match.status)).upper()
        if verdict not in ("ELIGIBLE", "LIKELY", "NEEDS_INFO"):
            verdict = rule_match.status
        reason = str(data.get("reason", "Verification required against official administrative guidelines.")).strip()
        return {"verdict": verdict, "reason": reason}
    except Exception as e:
        logger.warning(f"review_edge_case LLM call failed: {e}. Falling back to rule engine status.")
        fallback_reason = (
            f"Administrative review needed for {', '.join(rule_match.missing_info)}."
            if rule_match.missing_info
            else "Eligibility subject to field verification of documents."
        )
        return {"verdict": rule_match.status, "reason": fallback_reason}


def explain_results(result_summary: Dict[str, Any], language: str = "hi") -> str:
    """Generate a warm, plain citizen explanation at class-6 reading level.
    
    Language options: Hindi in Devanagari, Marathi in Devanagari, or simple English.
    Constraint: Max 120 words, no jargon, names schemes, yearly benefit, and first next step.
    """
    lang_name = "Hindi in Devanagari script"
    if language.lower() in ("mr", "marathi"):
        lang_name = "Marathi in Devanagari script"
    elif language.lower() in ("en", "english"):
        lang_name = "simple English"

    prompt = (
        f"You are SchemeSetu Bharat, a friendly and empathetic government welfare guide.\n"
        f"Write a warm, plain citizen explanation in {lang_name} at about class-6 reading level.\n"
        f"STRICT RULES:\n"
        f"- Maximum 120 words.\n"
        f"- Absolutely no administrative jargon.\n"
        f"- Clearly name the eligible welfare schemes and their total yearly monetary benefit in Rupees (Rs / ₹).\n"
        f"- State the single immediate first next step (e.g. visit nearest CSC center with Aadhaar card and land record).\n\n"
        f"Summary of Results:\n"
        f"{json.dumps(result_summary, ensure_ascii=False, indent=2)}\n"
    )

    try:
        resp = call_gemini(
            prompt=prompt,
            temperature=0.2,
            timeout_secs=20.0,
            max_retries=2,
        )
        if resp and resp.text:
            return resp.text.strip()
    except Exception as e:
        logger.warning(f"explain_results LLM call failed: {e}. Generating deterministic fallback.")

    # High-quality fallback explanation
    eligible_schemes = result_summary.get("eligible_schemes", [])
    total_benefit = result_summary.get("total_annual_benefit_inr", 0)
    scheme_names = [s.get("name") or s.get("scheme_id", "") for s in eligible_schemes[:3]]
    schemes_str = ", ".join(scheme_names) if scheme_names else "सरकारी योजनाएं"

    if language.lower() in ("mr", "marathi"):
        return (
            f"नमस्कार! आपल्या माहितीनुसार आपण {schemes_str} या योजनांसाठी पात्र आहात. "
            f"याद्वारे आपल्याला दरवर्षी एकूण ₹{total_benefit:,} चा लाभ मिळू शकतो. "
            f"अर्ज करण्यासाठी आपले आधार कार्ड आणि जमिनीचा दाखला घेऊन जवळच्या सीएससी केंद्रावर (CSC Center) भेट द्या."
        )
    elif language.lower() in ("en", "english"):
        return (
            f"Hello! Based on your details, you qualify for {schemes_str}. "
            f"You can receive total annual benefits of ₹{total_benefit:,}. "
            f"To get started, please visit your nearest Common Service Centre (CSC) with your Aadhaar card and land records."
        )
    else:
        return (
            f"नमस्ते! आपकी जानकारी के अनुसार आप {schemes_str} के लिए पूरी तरह पात्र हैं। "
            f"इन योजनाओं से आपको हर साल कुल ₹{total_benefit:,} का आर्थिक लाभ मिल सकता है। "
            f"आवेदन का पहला कदम: अपने आधार कार्ड और जमीन के कागजात लेकर नजदीकी ग्राहक सेवा केंद्र (CSC) पर जाएं।"
        )
