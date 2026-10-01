"""Offline / Heuristic Stub Agent for SchemeSetu Bharat.

Exposes run_agent(user_text, language, on_event) -> AgentResult.
Emits 8 scripted AgentEvents with 0.4s sleep between each,
and returns a realistic hard-coded result for a farmer named Ramesh from Nashik:
- PM-KISAN and KCC = ELIGIBLE
- Other 4 schemes = NOT_ELIGIBLE
- Fake CSC dict with simulated=True
- One fake application payload (simulated=True)
- pdf_path = None
"""

import time
from typing import Callable, Optional

from agent.models import (
    AgentEvent,
    AgentResult,
    CitizenProfile,
    SchemeMatch,
)


def run_agent(
    user_text: str = "",
    language: str = "hi",
    on_event: Optional[Callable[[AgentEvent], None]] = None,
) -> AgentResult:
    """Execute stub agent workflow with live telemetry simulation."""
    events = [
        AgentEvent(
            kind="thought",
            title="Understand Citizen Query",
            detail="Extracting citizen demographic profile: Ramesh, 42 yrs, Farmer from Nashik, Maharashtra, 1.2 ha land, annual income ₹85,000.",
        ),
        AgentEvent(
            kind="thought",
            title="Reason on Welfare Rules",
            detail="Checking statutory welfare eligibility rules against central and state schemes database for landholding farmer.",
        ),
        AgentEvent(
            kind="thought",
            title="Plan Tool Execution",
            detail="Planning sequential tool execution pipeline: verify schemes eligibility, locate nearest CSC center in Nashik, and pre-fill portal application.",
        ),
        AgentEvent(
            kind="tool_call",
            title="evaluate_eligibility",
            detail="Invoking deterministic rules engine with citizen profile (Nashik, Farmer, 1.2 ha cultivable land).",
        ),
        AgentEvent(
            kind="tool_result",
            title="evaluate_eligibility result",
            detail="Verified eligibility: PM-KISAN (Eligible - ₹6,000) and KCC (Eligible - ₹3,00,000 credit). 4 other schemes are NOT_ELIGIBLE.",
        ),
        AgentEvent(
            kind="tool_call",
            title="locate_nearest_csc",
            detail="Querying geolocation directory for nearest Common Service Centre in Nashik PIN 422003 (Simulated).",
        ),
        AgentEvent(
            kind="tool_result",
            title="locate_nearest_csc result & prefill_application",
            detail="Located CSC Center #204 Nashik (1.4 km). Pre-filled PM-KISAN portal application payload generated (Simulated).",
        ),
        AgentEvent(
            kind="final",
            title="Action Roadmap Ready",
            detail="Welfare discovery complete. Total potential annual benefit: ₹3,06,000 across 2 eligible schemes with verified CSC action plan.",
        ),
    ]

    emitted_events = []
    for ev in events:
        emitted_events.append(ev)
        if on_event:
            try:
                on_event(ev)
            except Exception:
                pass
        time.sleep(0.4)

    profile = CitizenProfile(
        name="Ramesh",
        age=42,
        gender="male",
        occupation="farmer",
        state="Maharashtra",
        district="Nashik",
        pin_code="422003",
        annual_income_inr=85000,
        land_hectares=1.2,
        caste_category="obc",
        is_bpl=False,
        has_pucca_house=False,
        has_lpg_connection=True,
        education_level="school",
        language=language,
    )

    matches = [
        SchemeMatch(
            scheme_id="pm_kisan",
            name="PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            status="ELIGIBLE",
            annual_benefit_inr=6000,
            reasons=[
                "Cultivable landholding 1.2 ha meets statutory small/marginal farmer criteria",
                "Non-taxpayer rural farmer family satisfies income and land ownership rules",
            ],
            missing_info=[],
            required_documents=[
                "Aadhaar Card",
                "Land Record / 7/12 Extract (Khatauni)",
                "Bank Account Passbook (Aadhaar Seeded)",
            ],
            portal_url="https://pmkisan.gov.in",
            friction_score=1,
            priority_rank=1,
        ),
        SchemeMatch(
            scheme_id="kcc",
            name="KCC (Kisan Credit Card)",
            status="ELIGIBLE",
            annual_benefit_inr=300000,
            reasons=[
                "Active cultivator with 1.2 ha land qualifies for concessional crop credit up to ₹3,00,000 at 4% interest subvention",
            ],
            missing_info=[],
            required_documents=[
                "Aadhaar Card",
                "Land Title Deed / 7/12 Extract",
                "Crop Sowing Certificate from Village Talathi/Patwari",
            ],
            portal_url="https://agricoop.nic.in/kcc",
            friction_score=2,
            priority_rank=2,
        ),
        SchemeMatch(
            scheme_id="ayushman_bharat",
            name="Ayushman Bharat (PM-JAY)",
            status="NOT_ELIGIBLE",
            annual_benefit_inr=0,
            reasons=[
                "Family not identified in SECC 2011 deprivation criteria or active BPL ration card registry",
            ],
            missing_info=["Active BPL / NFSA Ration Card"],
            required_documents=[
                "BPL Ration Card",
                "Tahsildar Income Certificate",
            ],
            portal_url="https://beneficiary.nha.gov.in",
            friction_score=3,
            priority_rank=None,
        ),
        SchemeMatch(
            scheme_id="pmay_g",
            name="PMAY-G (Pradhan Mantri Awaas Yojana - Gramin)",
            status="NOT_ELIGIBLE",
            annual_benefit_inr=0,
            reasons=[
                "Household income and asset profiling exceeds rural housing deprivation prioritization threshold",
            ],
            missing_info=[],
            required_documents=[
                "Aadhaar Card",
                "Affidavit of housing status",
            ],
            portal_url="https://pmayg.nic.in",
            friction_score=4,
            priority_rank=None,
        ),
        SchemeMatch(
            scheme_id="nsp_post_matric",
            name="NSP Post-Matric Scholarship",
            status="NOT_ELIGIBLE",
            annual_benefit_inr=0,
            reasons=[
                "Applicant is not currently an enrolled student (Age 42, Occupation: Farmer)",
            ],
            missing_info=[],
            required_documents=[
                "College Bonafide Certificate",
                "Caste Certificate",
            ],
            portal_url="https://scholarships.gov.in",
            friction_score=2,
            priority_rank=None,
        ),
        SchemeMatch(
            scheme_id="lakhpati_didi",
            name="Lakhpati Didi (NRLM - DAY)",
            status="NOT_ELIGIBLE",
            annual_benefit_inr=0,
            reasons=[
                "Scheme is exclusively restricted to female Self Help Group (SHG) members (Applicant is male)",
            ],
            missing_info=[],
            required_documents=[
                "SHG Membership Passbook",
                "Aadhaar Card",
            ],
            portal_url="https://nrlm.gov.in",
            friction_score=3,
            priority_rank=None,
        ),
    ]

    csc_center = {
        "simulated": True,
        "center_name": "Nashik Digital Seva CSC Center #204",
        "vle_name": "Sanjay Shinde (Village Level Entrepreneur)",
        "contact_phone": "+91 98220 54321",
        "address": "Near Gram Panchayat Bhavan, Dindori Road, Nashik, Maharashtra - 422003",
        "distance_km": 1.4,
        "operating_hours": "09:00 AM - 06:00 PM (Monday - Saturday)",
        "facilities": [
            "Aadhaar Biometric e-KYC Device",
            "7/12 Extract & Khasra Printout",
            "PM-KISAN Biometric Authentication",
        ],
    }

    application_payloads = {
        "pm_kisan": {
            "scheme_id": "pm_kisan",
            "applicant_name": "Ramesh",
            "state": "Maharashtra",
            "district": "Nashik",
            "land_hectares": 1.2,
            "bank_account_verified": True,
            "submission_status": "PRE_FILLED",
            "simulated": True,
        }
    }

    explanation = (
        "नमस्ते रमेश जी! आपके प्रोफाइल के अनुसार आप 2 प्रमुख कल्याणकारी योजनाओं के लिए पात्र हैं:\n"
        "1. पीएम-किसान सम्मान निधि (PM-KISAN) - ₹6,000 प्रति वर्ष सीधी आर्थिक सहायता।\n"
        "2. किसान क्रेडिट कार्ड (KCC) - ₹3,00,000 तक का 4% रियायती ब्याज दर पर कृषि ऋण।\n\n"
        "कुल संभावित वार्षिक लाभ: ₹3,06,000।\n"
        "आप अपने नजदीकी सीएससी केंद्र (नासिक डिजिटल सेवा केंद्र #204) पर जाकर आधार बायोमेट्रिक ई-केवाईसी पूरा कर सकते हैं।"
    )

    return AgentResult(
        profile=profile,
        matches=matches,
        total_annual_benefit_inr=306000,
        csc_center=csc_center,
        application_payloads=application_payloads,
        pdf_path=None,
        events=emitted_events,
        used_fallback=False,
        explanation=explanation,
    )
