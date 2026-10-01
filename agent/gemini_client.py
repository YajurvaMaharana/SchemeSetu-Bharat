"""Gemini Client module using the modern google-genai SDK.

RULES:
- Never hardcode secrets. Read GEMINI_API_KEY and GEMINI_MODEL from the environment using python-dotenv.
- Use the google-genai SDK (from google import genai), not the deprecated google-generativeai.
- Maintain a resilient fallback stub for offline testing and demo reliability when GEMINI_API_KEY is not set or USE_STUB=1.
"""

import json
import logging
import os
import re
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
USE_STUB = os.getenv("USE_STUB", "0").strip() == "1"


def get_genai_client():
    """Instantiate and return google-genai Client if API key is present."""
    if not GEMINI_API_KEY or USE_STUB:
        return None
    try:
        from google import genai
        return genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        logger.warning(f"Failed to initialize google-genai Client: {e}. Falling back to stub mode.")
        return None


def call_gemini(prompt: str, system_instruction: Optional[str] = None, json_mode: bool = False) -> Optional[str]:
    """Call Gemini using the google-genai SDK."""
    client = get_genai_client()
    if client is None:
        return None

    try:
        from google.genai import types

        config_args: Dict[str, Any] = {
            "temperature": 0.1,  # Low temperature for deterministic adherence
        }
        if system_instruction:
            config_args["system_instruction"] = system_instruction
        if json_mode:
            config_args["response_mime_type"] = "application/json"

        config = types.GenerateContentConfig(**config_args)

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=config,
        )
        return response.text
    except Exception as e:
        logger.warning(f"Error calling Gemini model '{GEMINI_MODEL}': {e}. Using deterministic fallback.")
        return None
