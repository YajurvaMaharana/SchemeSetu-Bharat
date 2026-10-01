"""Comprehensive verification script for A4: Gemini extraction & multilingual validation."""

import os
import re
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure repo root is on sys.path
repo_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(repo_root))

load_dotenv()

from agent.models import CitizenProfile
from agent.llm import extract_profile, explain_results


def main():
    # Force UTF-8 stdout for Windows consoles
    if sys.stdout.encoding.lower() != "utf-8":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    print("=" * 70)
    print("SchemeSetu Bharat — A4 Verification: LLM & Multilingual Extraction")
    print(f"Configured Model : {os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')}")
    key = os.getenv("GEMINI_API_KEY", "")
    key_display = f"{key[:8]}... (len {len(key)})" if key else "None"
    print(f"Configured Key   : {key_display}")
    print("=" * 70)

    # -------------------------------------------------------------
    # 1. Extraction Accuracy Check (Ramesh Clean Hinglish)
    # -------------------------------------------------------------
    ramesh_sentence = (
        "Main Ramesh, age 40 saal, Nashik Maharashtra se ek kisan hoon. "
        "Mere paas 1.5 acre zameen hai aur saalana aamdani 1.5 lakh rupaye hai."
    )
    print("\n[Step 1] Testing Ramesh Clean Hinglish Sentence:")
    print(f"Input: \"{ramesh_sentence}\"")
    p_ramesh = extract_profile(ramesh_sentence, language="hi")
    
    # Assertions
    assert isinstance(p_ramesh, CitizenProfile), "Profile must be a valid CitizenProfile instance"
    assert p_ramesh.occupation == "farmer", f"Expected 'farmer', got '{p_ramesh.occupation}'"
    assert p_ramesh.district == "Nashik", f"Expected 'Nashik', got '{p_ramesh.district}'"
    assert p_ramesh.annual_income_inr == 150000, f"Expected 150000, got {p_ramesh.annual_income_inr}"
    assert p_ramesh.land_hectares is not None and abs(p_ramesh.land_hectares - 0.61) < 0.01, (
        f"Expected ~0.61 ha, got {p_ramesh.land_hectares}"
    )
    print(">> Profile Verified Successfully:")
    print(f"   • occupation        : {p_ramesh.occupation}")
    print(f"   • district/location : {p_ramesh.district}")
    print(f"   • annual_income_inr : Rs. {p_ramesh.annual_income_inr:,}")
    print(f"   • land_hectares     : {p_ramesh.land_hectares} ha (from {p_ramesh.land_acres} acres)")

    # -------------------------------------------------------------
    # 2. Multilingual Check: Marathi Text
    # -------------------------------------------------------------
    marathi_sentence = (
        "मी सुरेश, वय ३८ वर्षे, सातारा महाराष्ट्र येथील शेतकरी आहे. "
        "माझी वार्षिक कमाई १ लाख रुपये आहे आणि २ एकर शेतजमीन आहे."
    )
    print("\n[Step 2] Testing Marathi Text (Devanagari numerals & Marathi terms):")
    print(f"Input: \"{marathi_sentence}\"")
    p_marathi = extract_profile(marathi_sentence, language="mr")
    
    assert isinstance(p_marathi, CitizenProfile), "Profile must be a valid CitizenProfile instance"
    assert p_marathi.occupation == "farmer", f"Expected 'farmer' from 'शेतकरी', got '{p_marathi.occupation}'"
    assert p_marathi.annual_income_inr == 100000, f"Expected 100000 from '१ लाख', got {p_marathi.annual_income_inr}"
    assert p_marathi.land_hectares is not None and abs(p_marathi.land_hectares - 0.81) < 0.02, (
        f"Expected ~0.81 ha from '२ एकर', got {p_marathi.land_hectares}"
    )
    print(">> Marathi Profile Verified Successfully:")
    print(f"   • age               : {p_marathi.age} (from ३८)")
    print(f"   • occupation        : {p_marathi.occupation} (from शेतकरी)")
    print(f"   • state             : {p_marathi.state}")
    print(f"   • district          : {p_marathi.district}")
    print(f"   • annual_income_inr : Rs. {p_marathi.annual_income_inr:,} (from १ लाख)")
    print(f"   • land_hectares     : {p_marathi.land_hectares} ha (from २ एकर)")

    # -------------------------------------------------------------
    # 3. Multilingual Check: Messy Hinglish Sentence
    # -------------------------------------------------------------
    messy_hinglish = (
        "bhai mera naam ramesh hai age around 40 years.. nashik maharashtra se hu "
        "kheti kisan ka kaam karta hu 1.5 acre land hai aur saal bhar me lagbhag dedh lakh (1.5L) kamai ho jati hai"
    )
    print("\n[Step 3] Testing Messy Hinglish Sentence:")
    print(f"Input: \"{messy_hinglish}\"")
    p_messy = extract_profile(messy_hinglish, language="hi")
    
    assert isinstance(p_messy, CitizenProfile), "Profile must be a valid CitizenProfile instance"
    assert p_messy.occupation == "farmer", f"Expected 'farmer', got '{p_messy.occupation}'"
    assert p_messy.district == "Nashik", f"Expected 'Nashik', got '{p_messy.district}'"
    assert p_messy.annual_income_inr == 150000, f"Expected 150000 from 'dedh lakh (1.5L)', got {p_messy.annual_income_inr}"
    assert p_messy.land_hectares is not None and abs(p_messy.land_hectares - 0.61) < 0.01, (
        f"Expected ~0.61 ha, got {p_messy.land_hectares}"
    )
    print(">> Messy Hinglish Profile Verified Successfully:")
    print(f"   • occupation        : {p_messy.occupation}")
    print(f"   • district/location : {p_messy.district}")
    print(f"   • annual_income_inr : Rs. {p_messy.annual_income_inr:,}")
    print(f"   • land_hectares     : {p_messy.land_hectares} ha")

    # -------------------------------------------------------------
    # 4. Devanagari Output Check (Hindi & Marathi explain_results)
    # -------------------------------------------------------------
    sample_summary = {
        "total_annual_benefit_inr": 306000,
        "eligible_schemes": [
            {"name": "Pradhan Mantri Kisan Samman Nidhi", "benefit_amount_inr": 6000},
            {"name": "Kisan Credit Card", "benefit_amount_inr": 300000}
        ]
    }
    print("\n[Step 4] Testing Devanagari Output Check in explain_results:")
    
    hi_text = explain_results(sample_summary, language="hi")
    mr_text = explain_results(sample_summary, language="mr")

    has_devanagari_hi = bool(re.search(r"[\u0900-\u097F]", hi_text))
    has_devanagari_mr = bool(re.search(r"[\u0900-\u097F]", mr_text))
    word_count_hi = len(hi_text.split())
    word_count_mr = len(mr_text.split())

    assert has_devanagari_hi, "Hindi explanation must contain Devanagari characters"
    assert has_devanagari_mr, "Marathi explanation must contain Devanagari characters"
    assert word_count_hi <= 120, f"Hindi word count {word_count_hi} exceeds 120 words"
    assert word_count_mr <= 120, f"Marathi word count {word_count_mr} exceeds 120 words"

    print(f">> Hindi Devanagari Verified: Valid script ({word_count_hi} words)")
    print(f"   Excerpt: {hi_text[:90]}...")
    print(f">> Marathi Devanagari Verified: Valid script ({word_count_mr} words)")
    print(f"   Excerpt: {mr_text[:90]}...")

    # -------------------------------------------------------------
    # 5. Schema Stability Check
    # -------------------------------------------------------------
    print("\n[Step 5] Schema Stability & Pydantic Validation:")
    for name, p in [("Ramesh", p_ramesh), ("Marathi", p_marathi), ("Messy", p_messy)]:
        data = p.model_dump()
        revalidated = CitizenProfile.model_validate(data)
        assert revalidated == p, f"Model re-validation failed for {name}"
    print(">> All CitizenProfile instances pass Pydantic v2 schema validation without errors.")

    print("\n" + "=" * 70)
    print("ALL A4 VERIFICATION CHECKS PASSED CLEANLY (5/5).")
    print("=" * 70)


if __name__ == "__main__":
    main()
