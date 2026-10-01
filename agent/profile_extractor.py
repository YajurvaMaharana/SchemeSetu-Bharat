"""Citizen Profile Extractor from vernacular and English natural language.

MANDATORY RULES:
- The LLM may only extract a profile from text.
- Money = integer INR.
- Land = hectares (1 acre = 0.4047 ha).
- Includes deterministic heuristic fallback for offline testing, stub mode, or API failures.
"""

import json
import re
from typing import Any, Dict, Optional

from agent.gemini_client import call_gemini
from agent.models import ACRES_TO_HECTARES, UserProfile


EXTRACTION_SYSTEM_PROMPT = """You are an expert citizen intake agent for SchemeSetu Bharat.
Your task is to extract structured citizen demographic and socio-economic attributes from citizen text (which may be in Hindi, English, Hinglish, Marathi, etc.).

Output ONLY valid JSON matching this schema:
{
  "name": string or null,
  "age": integer or null,
  "gender": "Male" | "Female" | "Other" | null,
  "state": string or null,
  "district": string or null,
  "pincode": string (6 digits) or null,
  "occupation": string or null (e.g. "Farmer", "Daily Wage Worker", "Student", "Artisan", "Self-Employed"),
  "annual_income_inr": integer INR or null,
  "land_hectares": float or null,
  "land_acres": float or null,
  "has_land_ownership": boolean or null,
  "social_category": "General" | "OBC" | "SC" | "ST" | null,
  "housing_type": "Pucca" | "Kutcha" | "Homeless" | "Rented" | null,
  "is_taxpayer": boolean,
  "is_govt_employee": boolean,
  "has_pension_above_10k": boolean,
  "is_shg_member": boolean,
  "is_student": boolean,
  "special_conditions": [list of strings],
  "preferred_language": "Hindi" | "English" | "Marathi"
}

CONVERSION RULES:
- 1 acre = 0.4047 hectares. If given in acres (e.g. "2 एकड़"), set land_acres=2.0 and land_hectares=0.8094.
- Money must be an integer in Indian Rupees (INR). E.g. "1.5 lakh" -> 150000, "50 हजार" -> 50000, "5000 per month" -> 60000.
- If landless ("भूमिहीन"), set land_hectares=0.0 and has_land_ownership=false.
- If joint ownership is mentioned ("संयुक्त खतौनी" / "joint land"), include "joint land ownership" in special_conditions.
- If tenant farmer ("बटाईदार" / "tenant"), include "tenant farmer" in special_conditions.
- Never hallucinate data not mentioned in the query.
"""


def heuristic_extract_profile(text: str) -> UserProfile:
    """Deterministic regex and keyword-based extractor for vernacular queries.
    
    Guarantees reliable demo execution even without external API connectivity.
    """
    profile_dict: Dict[str, Any] = {
        "raw_query": text,
        "special_conditions": [],
        "is_taxpayer": False,
        "is_govt_employee": False,
        "has_pension_above_10k": False,
        "is_shg_member": False,
        "is_student": False,
    }

    t = text.lower()
    # Normalize Devanagari digits to ASCII digits
    devanagari_digits = "०१२३४५६७८९"
    for d_idx, d_char in enumerate(devanagari_digits):
        t = t.replace(d_char, str(d_idx))

    # 1. Pincode
    pin_match = re.search(r"\b([1-9][0-9]{5})\b", text)
    if pin_match:
        profile_dict["pincode"] = pin_match.group(1)

    # 1b. Name
    name_match = re.search(r"(?:मैं|मेरा नाम|माझे नाव|name is|i am)\s+([A-Za-z\u0900-\u097F]+)", text, re.IGNORECASE)
    if name_match:
        cand_name = name_match.group(1).strip()
        if cand_name.lower() not in ["एक", "एकड़", "हूँ", "आहे", "from"]:
            profile_dict["name"] = cand_name
    elif "सुनीता" in t or "sunita" in t:
        profile_dict["name"] = "Sunita"
    elif "रमेश" in t or "ramesh" in t:
        profile_dict["name"] = "Ramesh"
    elif "प्रिया" in t or "priya" in t:
        profile_dict["name"] = "Priya"

    # 2. Age
    age_match = re.search(
        r"(?:age|उम्र|आयु|वर्ष|साल|वय)\s*[:=-]?\s*(\d{1,2})|(\d{1,2})\s*[-]?\s*(?:साल|saal|year|years|yr|yrs|वर्ष|वर्षे)",
        t,
    )
    if age_match:
        val = age_match.group(1) or age_match.group(2)
        if val:
            profile_dict["age"] = int(val)

    # 3. Gender
    if any(w in t for w in ["महिला", "female", "woman", "ladki", "aurat", "स्त्री", "सुनीता", "sunita", "priya", "प्रिया", "विद्यार्थिनी", "छात्रा", "गृहिणी"]):
        profile_dict["gender"] = "female"
    elif any(w in t for w in ["पुरुष", "male", "man", "purush", "aadmi", "लड़का", "विद्यार्थी", "ramesh", "रमेश"]):
        profile_dict["gender"] = "male"

    # 4. Occupation
    if any(w in t for w in ["kisan", "farmer", "किसान", "खेती", "agriculture", "काश्तकार", "शेतकरी", "shetkari"]):
        profile_dict["occupation"] = "Farmer"
    elif any(w in t for w in ["student", "विद्यार्थी", "विद्यार्थिनी", "छात्र", "छात्रा", "padhai", "college"]):
        profile_dict["occupation"] = "Student"
        profile_dict["is_student"] = True
    elif any(w in t for w in ["majdoor", "labourer", "मजदूर", "daily wage", "दिहाड़ी", "कामगार"]):
        profile_dict["occupation"] = "Daily Wage Worker"
    elif any(w in t for w in ["artisan", "karigar", "कारीगर", "weaver", "bunker", "tailor", "दर्जी"]):
        profile_dict["occupation"] = "Artisan"
    elif any(w in t for w in ["shop", "business", "दुकान", "व्यापार", "self employed", "स्वरोजगार"]):
        profile_dict["occupation"] = "Self-Employed"
    elif any(w in t for w in ["homemaker", "गृहणी", "गृहिणी", "housewife"]):
        profile_dict["occupation"] = "Homemaker"

    # 4b. Education Level
    if any(w in t for w in ["undergraduate", "ug", "पदवी", "degree", "graduation", "college", "b.a", "b.sc", "b.com", "b.tech"]):
        profile_dict["education_level"] = "undergraduate"
    elif any(w in t for w in ["postgraduate", "pg", "post-graduate", "m.a", "m.sc", "m.com"]):
        profile_dict["education_level"] = "postgraduate"
    elif any(w in t for w in ["school", "10th", "12th", "शाळा", "स्कूल"]):
        profile_dict["education_level"] = "school"

    # 5. Landholding
    land_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:एकड़|acre|acres|एकड|एकर)",
        t,
    )
    if land_match:
        acres = float(land_match.group(1))
        profile_dict["land_acres"] = acres
        profile_dict["land_hectares"] = round(acres * ACRES_TO_HECTARES, 4)
        profile_dict["has_land_ownership"] = True
    else:
        ha_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:hectare|hectares|हेक्टेयर|ha)\b", t)
        if ha_match:
            ha = float(ha_match.group(1))
            profile_dict["land_hectares"] = ha
            profile_dict["land_acres"] = round(ha / ACRES_TO_HECTARES, 2)
            profile_dict["has_land_ownership"] = True
        elif any(w in t for w in ["भूमिहीन", "landless", "no land", "जमीन नहीं"]):
            profile_dict["land_hectares"] = 0.0
            profile_dict["has_land_ownership"] = False

    # 6. Income
    # Check lakh / lac
    lakh_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lakh|lac|लाख)", t)
    if lakh_match:
        val = float(lakh_match.group(1))
        profile_dict["annual_income_inr"] = int(round(val * 100000))
    elif "डेढ़ लाख" in t or "dedh lakh" in t:
        profile_dict["annual_income_inr"] = 150000
    elif "ढाई लाख" in t:
        profile_dict["annual_income_inr"] = 250000
    else:
        # Check thousand / हजार
        thous_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:हजार|hazar|k\b|thousand)", t)
        if thous_match:
            val = float(thous_match.group(1))
            raw_val = int(round(val * 1000))
            if any(w in t for w in ["month", "महीना", "monthly", "प्रति माह"]):
                profile_dict["annual_income_inr"] = raw_val * 12
            else:
                profile_dict["annual_income_inr"] = raw_val
        else:
            # Check direct integer or comma-formatted numbers
            num_match = re.search(r"(?:आय|income|kamai|कमाई|उत्पन्न)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{1,3}(?:,\d{3})+|\d{4,7})", t)
            if num_match:
                cleaned_num = num_match.group(1).replace(",", "")
                profile_dict["annual_income_inr"] = int(cleaned_num)

    # 7. Social Category
    if re.search(r"\b(sc|dalit)\b", t, re.IGNORECASE) or "अनुसूचित जात" in t or "दलित" in t:
        profile_dict["social_category"] = "SC"
        profile_dict["caste_category"] = "sc"
    elif re.search(r"\b(st|adivasi)\b", t, re.IGNORECASE) or "अनुसूचित जमात" in t or "अनुसूचित जनजाति" in t or "आदिवासी" in t:
        profile_dict["social_category"] = "ST"
        profile_dict["caste_category"] = "st"
    elif re.search(r"\b(obc)\b", t, re.IGNORECASE) or "पिछड़ा" in t or "other backward" in t or "ओबीसी" in t:
        profile_dict["social_category"] = "OBC"
        profile_dict["caste_category"] = "obc"
    elif re.search(r"\b(general)\b", t, re.IGNORECASE) or "सामान्य" in t or "सवर्ण" in t:
        profile_dict["social_category"] = "General"
        profile_dict["caste_category"] = "general"

    # 8. Housing
    if any(w in t for w in ["kutcha", "kuchha", "कच्चा", "झोपड़ी", "kachha", "kacha", "tin sheet", "jhuggi"]):
        profile_dict["housing_type"] = "Kutcha"
        profile_dict["has_pucca_house"] = False
    elif any(w in t for w in ["pucca", "पक्का", "brick"]):
        profile_dict["housing_type"] = "Pucca"
        profile_dict["has_pucca_house"] = True
    elif any(w in t for w in ["homeless", "बेघर"]):
        profile_dict["housing_type"] = "Homeless"
        profile_dict["has_pucca_house"] = False
    elif any(w in t for w in ["rent", "किराये", "kiraya"]):
        profile_dict["housing_type"] = "Rented"

    # 8b. BPL status
    if any(w in t for w in ["bpl", "बीपीएल", "गरीबी रेखा", "दारीद्र्य", "antodaya", "antyodaya", "अन्त्योदय", "अंत्योदय"]):
        profile_dict["is_bpl"] = True

    # 8c. LPG connection
    if any(w in t for w in ["no lpg", "lpg connection nahi", "एलपीजी नहीं", "गैस कनेक्शन नहीं", "एलपीजी कनेक्शन नहीं", "गैस नहीं", "चूल्हा", "चूल्हे", "लकड़ी पर खाना"]):
        profile_dict["has_lpg_connection"] = False
    elif any(w in t for w in ["lpg connection hai", "गैस कनेक्शन है", "एलपीजी कनेक्शन है", "lpg hai"]):
        profile_dict["has_lpg_connection"] = True

    # 9. Exclusions & Special conditions
    if any(w in t for w in ["tax", "आयकर", "taxpayer", "टैक्स"]):
        if not any(neg in t for neg in ["no tax", "tax nahi", "टैक्स नहीं", "tax free"]):
            profile_dict["is_taxpayer"] = True

    if any(w in t for w in ["sarkari", "govt", "सरकारी नौकरी", "government"]):
        if not any(neg in t for neg in ["not govt", "no govt", "सरकारी नहीं"]):
            profile_dict["is_govt_employee"] = True

    if any(w in t for w in ["pension", "पेंशन"]):
        if any(w in t for w in [">10000", "10000 se zyada", "15000", "12000"]):
            profile_dict["has_pension_above_10k"] = True

    if any(w in t for w in ["shg", "स्वयं सहायता", "samuh", "bachat gat"]):
        profile_dict["is_shg_member"] = True

    if any(w in t for w in ["joint", "संयुक्त", "khatauni", "bhaiyo ke sath", "hissedari"]):
        profile_dict["special_conditions"].append("joint land ownership")

    if any(w in t for w in ["bataidar", "बटाईदार", "tenant", "kirayedari kheti"]):
        profile_dict["special_conditions"].append("tenant farmer")

    # 10. State detection (English and Hindi names)
    state_map = {
        "uttar pradesh": "Uttar Pradesh", "उत्तर प्रदेश": "Uttar Pradesh",
        "maharashtra": "Maharashtra", "महाराष्ट्र": "Maharashtra",
        "bihar": "Bihar", "बिहार": "Bihar",
        "madhya pradesh": "Madhya Pradesh", "मध्य प्रदेश": "Madhya Pradesh", "mp": "Madhya Pradesh",
        "rajasthan": "Rajasthan", "राजस्थान": "Rajasthan",
        "punjab": "Punjab", "पंजाब": "Punjab",
        "haryana": "Haryana", "हरियाणा": "Haryana",
        "west bengal": "West Bengal", "पश्चिम बंगाल": "West Bengal",
        "gujarat": "Gujarat", "गुजरात": "Gujarat",
        "odisha": "Odisha", "ओडिशा": "Odisha", "उड़ीसा": "Odisha",
        "jharkhand": "Jharkhand", "झारखंड": "Jharkhand",
        "karnataka": "Karnataka", "कर्नाटक": "Karnataka",
        "tamil nadu": "Tamil Nadu", "तमिलनाडु": "Tamil Nadu",
        "kerala": "Kerala", "केरल": "Kerala",
        "telangana": "Telangana", "तेलंगाना": "Telangana",
        "andhra pradesh": "Andhra Pradesh", "आंध्र प्रदेश": "Andhra Pradesh",
        "assam": "Assam", "असम": "Assam",
        "chhattisgarh": "Chhattisgarh", "छत्तीसगढ़": "Chhattisgarh",
        "uttarakhand": "Uttarakhand", "उत्तराखंड": "Uttarakhand",
        "himachal pradesh": "Himachal Pradesh", "हिमाचल प्रदेश": "Himachal Pradesh",
    }
    for key, standard_name in state_map.items():
        if key in t:
            profile_dict["state"] = standard_name
            break
    if not profile_dict.get("state") and re.search(r"\bup\b", t):
        profile_dict["state"] = "Uttar Pradesh"

    # District detection
    district_candidates = [
        ("nashik", "Nashik", "Maharashtra"),
        ("naasik", "Nashik", "Maharashtra"),
        ("नासिक", "Nashik", "Maharashtra"),
        ("नाशिक", "Nashik", "Maharashtra"),
        ("satara", "Satara", "Maharashtra"),
        ("सातारा", "Satara", "Maharashtra"),
        ("pune", "Pune", "Maharashtra"),
        ("पुणे", "Pune", "Maharashtra"),
        ("पुण्या", "Pune", "Maharashtra"),
        ("patna", "Patna", "Bihar"),
        ("पटना", "Patna", "Bihar"),
        ("lucknow", "Lucknow", "Uttar Pradesh"),
        ("लखनऊ", "Lucknow", "Uttar Pradesh"),
    ]
    for dist_key, dist_name, dist_state in district_candidates:
        if dist_key in t:
            profile_dict["district"] = dist_name
            if not profile_dict.get("state"):
                profile_dict["state"] = dist_state
            break

    # Language detection
    has_hindi_chars = bool(re.search(r"[\u0900-\u097F]", text))
    profile_dict["preferred_language"] = "Hindi" if has_hindi_chars else "English"

    return UserProfile(**profile_dict)


def extract_user_profile(user_text: str) -> UserProfile:
    """Extract UserProfile from citizen text using Gemini SDK with deterministic fallback."""
    llm_output = call_gemini(
        prompt=f"Citizen query: {user_text}",
        system_instruction=EXTRACTION_SYSTEM_PROMPT,
        json_mode=True,
    )

    if llm_output:
        try:
            # Strip potential code block formatting
            cleaned = re.sub(r"^```(?:json)?\s*", "", llm_output.strip())
            cleaned = re.sub(r"\s*```$", "", cleaned)
            parsed = json.loads(cleaned)
            parsed["raw_query"] = user_text
            return UserProfile(**parsed)
        except Exception:
            pass

    # Heuristic fallback
    return heuristic_extract_profile(user_text)
