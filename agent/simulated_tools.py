"""Simulated Action Tools for SchemeSetu Bharat.

MANDATORY RULES:
- Simulated features (CSC locator, form submit) must carry a flag simulated=true.
"""

from datetime import datetime, timezone
import random
from typing import Any, Dict, Optional
from agent.models import UserProfile


def locate_nearest_csc(pincode: Optional[str] = None, district: Optional[str] = None) -> Dict[str, Any]:
    """Simulate geolocation discovery of nearest Common Service Centre (CSC) desk.
    
    MUST carry simulated=True.
    """
    pin = pincode or "800001"
    dist = district or "Patna"

    return {
        "simulated": True,
        "center_name": f"CSC Digital Seva Kendra - Center #{pin[-3:] if len(pin) >= 3 else '101'}",
        "vle_name": "Rajesh Kumar Verma (Village Level Entrepreneur)",
        "contact_phone": "+91 98721 04512",
        "email": f"csc.vle.{pin}@digitalindia.gov.in",
        "address": f"Near Gram Panchayat Bhavan, Main Road, Block Center, Dist. {dist}, PIN - {pin}",
        "distance_km": round(1.2 + (hash(pin) % 30) / 10.0, 1),
        "operating_hours": "09:00 AM - 06:00 PM (Monday - Saturday)",
        "facilities": [
            "Aadhaar Biometric e-KYC Device",
            "Khasra/Khatauni Land Record Printout",
            "Income/Caste Certificate Application Filing",
            "Ayushman Card PVC Printing",
        ],
        "message": "Simulated CSC Locator lookup completed.",
    }


def mock_portal_submission(scheme_id: str, profile: UserProfile) -> Dict[str, Any]:
    """Simulate automated direct submission payload to government portal API.
    
    MUST carry simulated=True.
    """
    now = datetime.now(timezone.utc)
    ref_num = f"GOI-{scheme_id.upper()}-{now.strftime('%Y%m%d')}-{random.randint(100000, 999999)}"
    ack_code = f"ACK-{random.randint(1000, 9999)}-{random.randint(10, 99)}"

    return {
        "simulated": True,
        "submission_id": ref_num,
        "acknowledgement_number": ack_code,
        "scheme_id": scheme_id,
        "portal_endpoint": f"https://api.gov.in/v2/welfare/{scheme_id}/apply",
        "status": "PRE_FILED_SUCCESS",
        "timestamp": now.isoformat(),
        "applicant_snapshot": {
            "name": profile.name or "Citizen Applicant",
            "age": profile.age,
            "occupation": profile.occupation,
            "annual_income_inr": profile.annual_income_inr,
            "land_hectares": profile.land_hectares,
            "state": profile.state,
            "pincode": profile.pincode,
        },
        "next_step": "Present the acknowledgement number at nearest CSC or Tehsil for biometric Aadhaar e-KYC authentication.",
        "message": "Simulated government portal submission completed.",
    }
