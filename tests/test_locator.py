import pytest
from utils.locator import find_csc

def test_exact_pin():
    res = find_csc(None, "422011", None)
    assert res["match_level"] == "pin"
    assert res["district"] == "Nashik"
    assert res["simulated"] is True

def test_prefix_pin():
    res = find_csc(None, "422999", None)
    assert res["match_level"] == "prefix"
    assert res["district"] == "Nashik"

def test_district_match():
    res = find_csc("Chhatrapati Sambhajinagar", None, None)
    assert res["match_level"] == "district"
    assert res["district"] == "Aurangabad"

def test_fallback():
    res = find_csc("Unknown", "000000", "UnknownState")
    assert res["match_level"] == "fallback"
    assert "locator.csccloud.in" in res["url"]
