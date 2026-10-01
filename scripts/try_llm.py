"""Script to test LLM profile extraction on Ramesh Hinglish and a Marathi query."""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure repo root is on sys.path
repo_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(repo_root))

load_dotenv()

from agent.llm import extract_profile

def main():
    # Force UTF-8 stdout for Windows consoles
    if sys.stdout.encoding.lower() != "utf-8":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    print("=" * 60)
    print("Testing SchemeSetu Bharat LLM Profile Extractor")
    print(f"Configured Model: {os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')}")
    key = os.getenv("GEMINI_API_KEY", "")
    print(f"API Key configured: {'Yes (length ' + str(len(key)) + ')' if key else 'No'}")
    print("=" * 60)

    # Test 1: Ramesh Hinglish sentence
    ramesh_sentence = (
        "Main Ramesh, age 40 saal, Nashik Maharashtra se ek kisan hoon. "
        "Mere paas 1.5 acre zameen hai aur saalana aamdani 1.5 lakh rupaye hai."
    )
    print("\n--- 1. Testing Ramesh Hinglish Sentence ---")
    print(f"Input: {ramesh_sentence}")
    profile_ramesh = extract_profile(ramesh_sentence, language="hi")
    print("Parsed Profile (Ramesh):")
    print(profile_ramesh.model_dump_json(indent=2))

    # Test 2: Marathi sentence
    marathi_sentence = (
        "मी सुरेश, वय ३८ वर्षे, सातारा महाराष्ट्र येथील शेतकरी आहे. "
        "माझी वार्षिक कमाई १ लाख रुपये आहे आणि २ एकर शेतजमीन आहे."
    )
    print("\n--- 2. Testing Marathi Sentence ---")
    print(f"Input: {marathi_sentence}")
    profile_marathi = extract_profile(marathi_sentence, language="mr")
    print("Parsed Profile (Marathi):")
    print(profile_marathi.model_dump_json(indent=2))
    print("\n" + "=" * 60)
    print("All profile extraction tests completed successfully.")

if __name__ == "__main__":
    main()
