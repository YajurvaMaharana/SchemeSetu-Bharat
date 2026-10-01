"""Common Service Center (CSC) locator utility.

Finds or simulates the nearest Digital Seva Kendra for citizen biometric authentication
and offline application submission.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional


def load_csc_centers() -> List[Dict[str, Any]]:
    """Load pre-configured CSC centers from data/csc_centers.json if available."""
    data_path = Path(__file__).resolve().parent.parent / "data" / "csc_centers.json"
    if data_path.exists():
        try:
            with open(data_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []


def find_csc(
    district: Optional[str] = None,
    pin_code: Optional[str] = None,
    state: Optional[str] = None,
) -> Dict[str, Any]:
    """Find the nearest CSC center matching the district, pin_code, or state.
    
    Always includes simulated=True attribute.
    """
    centers = load_csc_centers()
    dist_clean = (district or "").lower().strip()
    pin_clean = (pin_code or "").strip()
    state_clean = (state or "").lower().strip()

    # Search for matching district or pin_code
    for c in centers:
        if dist_clean and dist_clean in str(c.get("district", "")).lower():
            c_copy = dict(c)
            c_copy["simulated"] = True
            return c_copy
        if pin_clean and pin_clean in str(c.get("pin_code", "")):
            c_copy = dict(c)
            c_copy["simulated"] = True
            return c_copy

    # Fallback to simulated placeholder
    pin = pin_code or "422001"
    dist = district or "Nashik"
    st = state or "Maharashtra"

    return {
        "simulated": True,
        "center_id": f"CSC_{pin[-4:] if len(pin) >= 4 else '1001'}",
        "center_name": f"CSC Digital Seva Kendra - {dist} Central",
        "district": dist,
        "state": st,
        "pin_code": pin,
        "address": f"Near Tehsil Office, Main Market, Dist. {dist}, {st} - {pin}",
        "vle_name": "Sanjay Patil (Village Level Entrepreneur)",
        "contact_phone": "+91 98230 45678",
        "distance_km": 2.4,
        "operating_hours": "09:00 AM - 06:00 PM (Mon-Sat)",
        "facilities": [
            "Aadhaar Biometric e-KYC Device",
            "Land Record (7/12 & Khatauni) Printout",
            "Income & Caste Certificate Submissions",
            "Ayushman PVC Card Delivery",
        ],
        "message": "Nearest CSC center discovered successfully.",
    }


find_nearest_csc = find_csc
locate_csc = find_csc
