"""Unit tests for vernacular profile extraction and unit normalizations.

RULES TESTED:
- Vernacular Hindi, English, Hinglish queries
- Money = integer INR
- Land = hectares (1 acre = 0.4047 ha)
"""

import pytest
from agent.profile_extractor import heuristic_extract_profile


def test_hindi_farmer_profile_extraction():
    query = "नमस्ते, मैं बिहार से हूँ, मेरी उम्र 38 साल है, मैं किसान हूँ और मेरे पास 2 एकड़ जमीन है। मेरी सालाना कमाई 80 हजार है।"
    profile = heuristic_extract_profile(query)

    assert profile.age == 38
    assert profile.occupation == "farmer"
    assert profile.land_acres == 2.0
    assert profile.land_hectares == 0.8094
    assert profile.annual_income_inr == 80000
    assert profile.state == "Bihar"
    assert profile.preferred_language == "Hindi"


def test_hinglish_lakh_income_conversion():
    query = "meri age 25 saal hai, daily wage worker hu, income lagbhag 1.5 lakh per year hai, kacha ghar hai"
    profile = heuristic_extract_profile(query)

    assert profile.age == 25
    assert profile.occupation == "labourer"
    assert profile.annual_income_inr == 150000
    assert profile.housing_type == "Kutcha"


def test_student_sc_category_extraction():
    query = "I am a 21 year old student from SC category with family income 1.8 lakh living in pincode 201301"
    profile = heuristic_extract_profile(query)

    assert profile.age == 21
    assert profile.occupation == "student"
    assert profile.is_student is True
    assert profile.social_category == "SC"
    assert profile.annual_income_inr == 180000
    assert profile.pincode == "201301"


def test_landless_rural_citizen():
    query = "मैं भूमिहीन मजदूर हूँ, कोई जमीन नहीं है, उम्र 45 वर्ष, कच्चा मकान है"
    profile = heuristic_extract_profile(query)

    assert profile.age == 45
    assert profile.has_land_ownership is False
    assert profile.land_hectares == 0.0
    assert profile.housing_type == "Kutcha"


def test_taxpayer_flag_detection():
    query = "I am a farmer with 5 acres land, but I pay income tax every year"
    profile = heuristic_extract_profile(query)

    assert profile.occupation == "farmer"
    assert profile.is_taxpayer is True
    assert profile.land_acres == 5.0
