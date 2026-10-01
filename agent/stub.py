"""Scripted realistic offline stub agent for SchemeSetu Bharat.

Provides instant, realistic responses and telemetry for SYNC 1 demo testing without requiring live LLM API keys.
Supports:
1. Sample 1: Ramesh (Farmer, Nashik, 1.5 acre, 1.5L income) -> PM-KISAN, KCC
2. Sample 2: Marathi Student (Priya, Pune, SC, 2L income) -> NSP Post-Matric Scholarship
3. Sample 3: Sunita (Bihar, BPL, Homemaker, no LPG) -> PM Ujjwala Yojana 2.0, Ayushman Bharat
"""

import time
from typing import Any, Callable, Dict, List, Optional
from datetime import datetime, timezone

from agent.events import AgentEvent, AgentEventCallback
from agent.models import (
    AgentResponse,
    EligibilityStatus,
    SchemeEligibilityResult,
    UserProfile,
)


def _emit(on_event: Optional[AgentEventCallback], step: str, status: str, message: str, simulated: bool = False, data: Optional[Dict[str, Any]] = None):
    ev = AgentEvent(
        step=step,
        status=status,
        message=message,
        simulated=simulated,
        data=data,
        timestamp=datetime.now(timezone.utc).strftime("%H:%M:%S"),
    )
    if on_event:
        try:
            on_event(ev)
        except Exception:
            pass
    return ev


def run_stub_agent(
    user_text: str,
    language: str = "hi",
    on_event: Optional[AgentEventCallback] = None,
) -> AgentResponse:
    """Execute scripted deterministic workflow with realistic live telemetry."""
    events: List[AgentEvent] = []
    t = user_text.lower()

    # Determine which profile this is
    is_marathi_student = any(w in t for w in ["vidyarthi", "विद्यार्थी", "student", "pune", "पुणे", "sc category", "2 lakh", "marathi"])
    is_sunita = any(w in t for w in ["sunita", "सुनीता", "bihar", "बिहार", "bpl", "gas", "lpg", "उज्ज्वला", "ujjwala"])

    if is_marathi_student:
        # Sample 2: Marathi Student
        events.append(_emit(on_event, "PROFILE_EXTRACTION", "IN_PROGRESS", "Extracting Marathi student profile from natural language input..."))
        time.sleep(0.3)
        events.append(_emit(on_event, "PROFILE_EXTRACTION", "COMPLETED", "Extracted: Priya (Student, Age 19, Pune, SC, Family Income ₹2,00,000)."))
        time.sleep(0.3)

        events.append(_emit(on_event, "DETERMINISTIC_RULES", "IN_PROGRESS", "Evaluating 10 flagship welfare schemes against student profile..."))
        time.sleep(0.3)
        events.append(_emit(on_event, "DETERMINISTIC_RULES", "COMPLETED", "Deterministic rules verified: Post-Matric SC Scholarship eligible (₹48,000/yr)."))
        time.sleep(0.3)

        events.append(_emit(on_event, "CSC_LOCATOR", "COMPLETED", "Located nearest CSC: Pune Digital Seva Kendra, Shivajinagar (0.8 km).", simulated=True))
        time.sleep(0.3)
        events.append(_emit(on_event, "DELIVER", "COMPLETED", "Action Roadmap & Marathi vernacular instructions generated."))

        profile = UserProfile(
            name="Priya",
            age=19,
            gender="Female",
            occupation="Student",
            state="Maharashtra",
            district="Pune",
            annual_income_inr=200000,
            social_category="SC",
            caste_category="sc",
            education_level="undergraduate",
            is_student=True,
            language="mr",
        )

        eligible = [
            SchemeEligibilityResult(
                scheme_id="nsp_post_matric",
                scheme_name="Centrally Sponsored Post-Matric Scholarship for SC Students",
                scheme_name_hi="अनुसूचित जाति पोस्ट-मैट्रिक छात्रवृत्ति",
                category="Education",
                status=EligibilityStatus.ELIGIBLE,
                benefit_amount_inr=48000,
                benefit_description="Compulsory non-refundable fee reimbursement plus ₹48,000 annual maintenance allowance.",
                benefit_frequency="Annual",
                passed_criteria=["Enrolled SC student in recognized undergraduate course", "Family annual income ₹2,00,000 is below the ₹2,50,000 ceiling."],
                failed_criteria=[],
                edge_case_flags=[],
                required_documents=["Aadhaar Card", "SC Caste Certificate from Tehsildar", "College Bonafide Certificate", "Previous Qualifying Marksheet"],
                portal_url="https://scholarships.gov.in",
                application_mode="Online via National Scholarship Portal (NSP)",
                friction_score=2,
            ),
            SchemeEligibilityResult(
                scheme_id="mudra_shishu",
                scheme_name="PM Mudra Yojana (Shishu Loan)",
                scheme_name_hi="प्रधानमंत्री मुद्रा योजना (शिशु ऋण)",
                category="Financial Inclusion",
                status=EligibilityStatus.ELIGIBLE,
                benefit_amount_inr=50000,
                benefit_description="Collateral-free micro business loan up to ₹50,000 for young entrepreneurs.",
                benefit_frequency="One-Time",
                passed_criteria=["Age criteria satisfied (19 years >= 18 years)", "No existing bank default history."],
                failed_criteria=[],
                edge_case_flags=[],
                required_documents=["Aadhaar Card", "Bank Account Passbook", "Proof of Vocational/Trade Activity"],
                portal_url="https://www.mudra.org.in",
                application_mode="Bank Branch / Udyamimitra Portal",
                friction_score=2,
            ),
        ]

        review = [
            SchemeEligibilityResult(
                scheme_id="ayushman_bharat",
                scheme_name="Ayushman Bharat (PM-JAY)",
                scheme_name_hi="आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना",
                category="Healthcare",
                status=EligibilityStatus.NEEDS_REVIEW,
                benefit_amount_inr=500000,
                benefit_description="₹5,00,000 cashless health insurance cover per family per year.",
                benefit_frequency="Annual",
                passed_criteria=["Family income ₹2,00,000 complies with income ceiling of ₹2,50,000."],
                failed_criteria=[],
                edge_case_flags=["Ration card NFSA / SECC linkage required for issuance of Ayushman Golden Card."],
                llm_edge_review="Family may apply for state NFSA ration card linkage or check SECC 2011 status at Gram Panchayat desk.",
                required_documents=["Aadhaar Card", "Ration Card", "Tahsildar Income Certificate"],
                portal_url="https://beneficiary.nha.gov.in",
                application_mode="CSC Center / Empaneled Hospital Desk",
                friction_score=3,
            )
        ]

        ineligible = [
            SchemeEligibilityResult(
                scheme_id="pm_kisan",
                scheme_name="PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                scheme_name_hi="प्रधानमंत्री किसान सम्मान निधि",
                category="Agriculture",
                status=EligibilityStatus.NOT_ELIGIBLE,
                benefit_amount_inr=6000,
                benefit_description="₹6,000 annual direct cash transfer.",
                benefit_frequency="Annual",
                passed_criteria=[],
                failed_criteria=["Occupation is Student; PM-KISAN strictly requires ownership of cultivable agricultural land."],
                edge_case_flags=[],
                required_documents=["Aadhaar Card", "Land Title Deed"],
                portal_url="https://pmkisan.gov.in",
                application_mode="Online Portal / CSC Kiosk",
                friction_score=1,
            )
        ]

        summary_text = (
            "नमस्कार प्रिया! आपल्या माहितीनुसार आपण पोस्ट-मॅट्रिक शिष्यवृत्ती (Post-Matric SC Scholarship) योजनेसाठी पूर्णपणे पात्र आहात. "
            "याद्वारे आपल्याला दरवर्षी ₹48,000 पर्यंत शिक्षण सहाय्य मिळू शकते. "
            "आपल्या जवळील सीएससी केंद्रावर (पुणे डिजिटल सेवा केंद्र, शिवाजीनगर) जाऊन आपले अर्ज प्रक्रिया पूर्ण करा."
        )

        csc_rec = {
            "center_name": "Pune Digital Seva Kendra #108",
            "vle_name": "Ganesh Kulkarni",
            "contact_phone": "+91 98231 67890",
            "address": "Opposite Bus Stand, FC Road, Shivajinagar, Pune - 411005",
            "distance_km": 0.8,
            "simulated": True,
        }

        total_benefit = sum(s.benefit_amount_inr for s in eligible)

        return AgentResponse(
            user_profile=profile,
            eligible_schemes=eligible,
            review_schemes=review,
            ineligible_schemes=ineligible,
            total_potential_benefit_inr=total_benefit,
            summary_text=summary_text,
            vernacular_summary=summary_text,
            csc_recommendation=csc_rec,
            events=events,
        )

    elif is_sunita:
        # Sample 3: Sunita (BPL, Bihar, No LPG)
        events.append(_emit(on_event, "PROFILE_EXTRACTION", "IN_PROGRESS", "Extracting citizen profile for Sunita (Bihar, BPL)..."))
        time.sleep(0.3)
        events.append(_emit(on_event, "PROFILE_EXTRACTION", "COMPLETED", "Extracted: Sunita (Female, Age 32, Bihar, BPL, No LPG connection)."))
        time.sleep(0.3)

        events.append(_emit(on_event, "DETERMINISTIC_RULES", "IN_PROGRESS", "Executing deterministic statutory eligibility checks..."))
        time.sleep(0.3)
        events.append(_emit(on_event, "DETERMINISTIC_RULES", "COMPLETED", "Verified: PM Ujjwala Yojana 2.0 and Ayushman Bharat PM-JAY eligible!"))
        time.sleep(0.3)

        events.append(_emit(on_event, "CSC_LOCATOR", "COMPLETED", "Located nearest CSC: Patna Seva Kendra #42, Danapur, Bihar (1.2 km).", simulated=True))
        time.sleep(0.3)
        events.append(_emit(on_event, "DELIVER", "COMPLETED", "Generated Action Pack for PM Ujjwala 2.0 & Ayushman Bharat."))

        profile = UserProfile(
            name="Sunita",
            age=32,
            gender="Female",
            occupation="Homemaker",
            state="Bihar",
            district="Patna",
            is_bpl=True,
            has_lpg_connection=False,
            has_pucca_house=False,
            housing_type="Kutcha",
            language="hi",
        )

        eligible = [
            SchemeEligibilityResult(
                scheme_id="ayushman_bharat",
                scheme_name="Ayushman Bharat (PM-JAY)",
                scheme_name_hi="आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना",
                category="Healthcare",
                status=EligibilityStatus.ELIGIBLE,
                benefit_amount_inr=500000,
                benefit_description="₹5,00,000 per family per year for cashless hospitalization across empaneled hospitals.",
                benefit_frequency="Annual",
                passed_criteria=["BPL / Deprivation status satisfied", "Income criteria met"],
                failed_criteria=[],
                edge_case_flags=[],
                required_documents=["Aadhaar Card", "Ration Card (BPL/Antyodaya)", "Active Mobile Number"],
                portal_url="https://beneficiary.nha.gov.in",
                application_mode="CSC Center / Hospital Helpdesk",
                friction_score=2,
            ),
            SchemeEligibilityResult(
                scheme_id="pm_ujjwala",
                scheme_name="PM Ujjwala Yojana 2.0 (PMUY)",
                scheme_name_hi="प्रधानमंत्री उज्ज्वला योजना 2.0",
                category="Clean Energy",
                status=EligibilityStatus.ELIGIBLE,
                benefit_amount_inr=3600,
                benefit_description="Deposit-free LPG cylinder connection, free first refill and stove, plus ₹300/cylinder subsidy.",
                benefit_frequency="Annual",
                passed_criteria=["Adult woman applicant", "BPL household with no existing LPG connection"],
                failed_criteria=[],
                edge_case_flags=[],
                required_documents=["Aadhaar Card", "BPL Ration Card", "Bank Account Passbook", "Self-Declaration Affidavit of No LPG"],
                portal_url="https://www.pmuy.gov.in",
                application_mode="LPG Distributor / CSC Kiosk",
                friction_score=1,
            ),
            SchemeEligibilityResult(
                scheme_id="lakhpati_didi",
                scheme_name="Lakhpati Didi (NRLM - DAY)",
                scheme_name_hi="लखपति दीदी योजना",
                category="Women Empowerment",
                status=EligibilityStatus.ELIGIBLE,
                benefit_amount_inr=100000,
                benefit_description="Micro-enterprise livelihood capital and skill training to reach ₹1,00,000 annual income.",
                benefit_frequency="One-Time",
                passed_criteria=["Adult woman resident in rural village", "Eligible for Self Help Group (SHG) livelihood federation"],
                failed_criteria=[],
                edge_case_flags=[],
                required_documents=["Aadhaar Card", "Bank Account Details", "SHG Group Resolution"],
                portal_url="https://nrlm.gov.in",
                application_mode="Gram Panchayat / SHG Cluster Federation",
                friction_score=3,
            ),
        ]

        review = [
            SchemeEligibilityResult(
                scheme_id="pmay_g",
                scheme_name="PMAY-G (Pradhan Mantri Awaas Yojana - Gramin)",
                scheme_name_hi="प्रधानमंत्री आवास योजना - ग्रामीण",
                category="Housing",
                status=EligibilityStatus.NEEDS_REVIEW,
                benefit_amount_inr=120000,
                benefit_description="₹1,20,000 financial grant for pucca house construction.",
                benefit_frequency="One-Time",
                passed_criteria=["Kutcha house dwelling status confirmed"],
                failed_criteria=[],
                edge_case_flags=["Inclusion in Gram Sabha Awaas+ priority waitlist required."],
                llm_edge_review="Applicant has Kutcha dwelling; Gram Panchayat Secretary needs to confirm inclusion in Awaas+ waitlist.",
                required_documents=["Aadhaar Card", "MGNREGA Job Card", "Kutcha House Photograph"],
                portal_url="https://pmayg.nic.in",
                application_mode="Gram Panchayat / Block Office",
                friction_score=4,
            )
        ]

        ineligible = []

        summary_text = (
            "नमस्ते सुनीता जी! आपकी जानकारी के अनुसार आप प्रधानमंत्री उज्ज्वला योजना 2.0 (मुफ्त गैस कनेक्शन) "
            "और आयुष्मान भारत (₹5,00,000 का मुफ्त इलाज) के लिए पूरी तरह पात्र हैं। "
            "इसके अलावा आप लखपति दीदी योजना के तहत ₹1,00,000 की आजीविका सहायता भी प्राप्त कर सकती हैं। "
            "आवेदन के लिए अपने आधार कार्ड और राशन कार्ड के साथ नजदीकी ग्राहक सेवा केंद्र (सीएससी) पर जाएं।"
        )

        csc_rec = {
            "center_name": "Patna Digital Seva CSC Kendra #42",
            "vle_name": "Manoj Kumar",
            "contact_phone": "+91 94310 12345",
            "address": "Main Road, Danapur Cantt, Patna, Bihar - 801503",
            "distance_km": 1.2,
            "simulated": True,
        }

        total_benefit = sum(s.benefit_amount_inr for s in eligible)

        return AgentResponse(
            user_profile=profile,
            eligible_schemes=eligible,
            review_schemes=review,
            ineligible_schemes=ineligible,
            total_potential_benefit_inr=total_benefit,
            summary_text=summary_text,
            vernacular_summary=summary_text,
            csc_recommendation=csc_rec,
            events=events,
        )

    else:
        # Default: Sample 1 Ramesh (Farmer, Nashik)
        events.append(_emit(on_event, "PROFILE_EXTRACTION", "IN_PROGRESS", "Extracting citizen profile for Ramesh (Nashik, Maharashtra)..."))
        time.sleep(0.3)
        events.append(_emit(on_event, "PROFILE_EXTRACTION", "COMPLETED", "Extracted: Ramesh (Male, Age 40, Farmer, Nashik, 1.5 acres, Income ₹1,50,000)."))
        time.sleep(0.3)

        events.append(_emit(on_event, "DETERMINISTIC_RULES", "IN_PROGRESS", "Running deterministic rules across all 10 welfare programs..."))
        time.sleep(0.3)
        events.append(_emit(on_event, "DETERMINISTIC_RULES", "COMPLETED", "Identified 5 eligible schemes (KCC, PM-KISAN, PM-KMY, PMSBY, PMJJBY). Total: ₹7,06,000."))
        time.sleep(0.3)

        events.append(_emit(on_event, "CSC_LOCATOR", "COMPLETED", "Located nearest CSC: Nashik Digital Seva CSC Center #204 (1.4 km).", simulated=True))
        time.sleep(0.3)
        events.append(_emit(on_event, "DELIVER", "COMPLETED", "Action Roadmap & pre-filled application payloads ready."))

        profile = UserProfile(
            name="Ramesh",
            age=40,
            gender="Male",
            occupation="Farmer",
            state="Maharashtra",
            district="Nashik",
            annual_income_inr=150000,
            land_acres=1.5,
            land_hectares=0.607,
            has_land_ownership=True,
            is_taxpayer=False,
            is_govt_employee=False,
            housing_type="Kutcha",
            language="hi",
        )

        eligible = [
            SchemeEligibilityResult(
                scheme_id="kcc",
                scheme_name="KCC (Kisan Credit Card)",
                scheme_name_hi="किसान क्रेडिट कार्ड योजना",
                category="Agriculture",
                status=EligibilityStatus.ELIGIBLE,
                benefit_amount_inr=300000,
                benefit_description="Concessional agricultural revolving credit up to ₹3,00,000 at 4% interest subvention.",
                benefit_frequency="Revolving Credit",
                passed_criteria=["Cultivator with 0.61 ha landholding satisfies KCC guidelines.", "Prompt repayment 3% interest subsidy applies."],
                failed_criteria=[],
                edge_case_flags=[],
                required_documents=["Aadhaar Card", "Land Title Deed / 7/12 Extract", "Crop Sowing Certificate (Talathi)"],
                portal_url="https://agricoop.nic.in/kcc",
                application_mode="Bank Branch / CSC Kiosk",
                friction_score=2,
            ),
            SchemeEligibilityResult(
                scheme_id="pmjjby",
                scheme_name="PMJJBY (Pradhan Mantri Jeevan Jyoti Bima Yojana)",
                scheme_name_hi="प्रधानमंत्री जीवन ज्योति बीमा योजना",
                category="Social Security",
                status=EligibilityStatus.ELIGIBLE,
                benefit_amount_inr=200000,
                benefit_description="₹2,00,000 life insurance cover for annual premium of ₹436.",
                benefit_frequency="Annual",
                passed_criteria=["Applicant age (40 yrs) is within eligible bracket of 18 to 50 years."],
                failed_criteria=[],
                edge_case_flags=[],
                required_documents=["Aadhaar Card", "Bank Account Passbook with Auto-Debit Mandate"],
                portal_url="https://jansuraksha.gov.in",
                application_mode="Bank Branch / Net Banking / CSC",
                friction_score=1,
            ),
            SchemeEligibilityResult(
                scheme_id="pmsby",
                scheme_name="PMSBY (Pradhan Mantri Suraksha Bima Yojana)",
                scheme_name_hi="प्रधानमंत्री सुरक्षा बीमा योजना",
                category="Social Security",
                status=EligibilityStatus.ELIGIBLE,
                benefit_amount_inr=200000,
                benefit_description="₹2,00,000 accidental death & disability insurance for ₹20/year.",
                benefit_frequency="Annual",
                passed_criteria=["Applicant age (40 yrs) is within 18 to 70 years window."],
                failed_criteria=[],
                edge_case_flags=[],
                required_documents=["Aadhaar Card", "Savings Bank Account"],
                portal_url="https://jansuraksha.gov.in",
                application_mode="Bank Branch / Net Banking / CSC",
                friction_score=1,
            ),
            SchemeEligibilityResult(
                scheme_id="pm_kmy",
                scheme_name="PM-KMY (Pradhan Mantri Kisan Maandhan Yojana)",
                scheme_name_hi="प्रधानमंत्री किसान मानधन योजना",
                category="Social Security",
                status=EligibilityStatus.ELIGIBLE,
                benefit_amount_inr=36000,
                benefit_description="Guaranteed pension of ₹3,000/month (₹36,000/year) after age 60.",
                benefit_frequency="Annual",
                passed_criteria=["Age exactly 40 is within eligible entry band (18-40 years).", "Landholding (0.61 ha) is well within 2.0 ha ceiling."],
                failed_criteria=[],
                edge_case_flags=[],
                required_documents=["Aadhaar Card", "Savings Bank Account", "7/12 Land Record Extract"],
                portal_url="https://maandhan.in",
                application_mode="CSC Kiosk / Maandhan Portal",
                friction_score=2,
            ),
            SchemeEligibilityResult(
                scheme_id="pm_kisan",
                scheme_name="PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                scheme_name_hi="प्रधानमंत्री किसान सम्मान निधि",
                category="Agriculture",
                status=EligibilityStatus.ELIGIBLE,
                benefit_amount_inr=6000,
                benefit_description="₹6,000 per year delivered in 3 equal four-monthly installments directly to bank account.",
                benefit_frequency="Annual",
                passed_criteria=["Cultivable agricultural landholding (0.61 ha) satisfies landholder rules.", "Non-taxpayer rural citizen complies with statutory guidelines."],
                failed_criteria=[],
                edge_case_flags=[],
                required_documents=["Aadhaar Card", "7/12 Extract / Khasra-Khatauni", "Aadhaar-Seeded Bank Passbook"],
                portal_url="https://pmkisan.gov.in",
                application_mode="Online Portal / CSC Kiosk",
                friction_score=1,
            ),
        ]

        review = [
            SchemeEligibilityResult(
                scheme_id="mudra_shishu",
                scheme_name="PM Mudra Yojana (Shishu Loan)",
                scheme_name_hi="प्रधानमंत्री मुद्रा योजना (शिशु ऋण)",
                category="Financial Inclusion",
                status=EligibilityStatus.NEEDS_REVIEW,
                benefit_amount_inr=50000,
                benefit_description="Collateral-free micro business loan up to ₹50,000.",
                benefit_frequency="One-Time",
                passed_criteria=["Age criteria met"],
                failed_criteria=[],
                edge_case_flags=["Allied farm trade or agri-business plan proposal required."],
                llm_edge_review="Eligible if Ramesh submits a simple proposal for dairy, poultry, or agri-processing micro-enterprise.",
                required_documents=["Aadhaar Card", "Business Plan Proposal", "Bank Passbook"],
                portal_url="https://www.mudra.org.in",
                application_mode="Bank Branch / Udyamimitra Portal",
                friction_score=2,
            )
        ]

        ineligible = [
            SchemeEligibilityResult(
                scheme_id="nsp_post_matric",
                scheme_name="Post-Matric Scholarship for SC/ST/OBC Students",
                scheme_name_hi="अनुसूचित जाति/जनजाति पोस्ट-मैट्रिक छात्रवृत्ति",
                category="Education",
                status=EligibilityStatus.NOT_ELIGIBLE,
                benefit_amount_inr=48000,
                benefit_description="Scholarship and maintenance allowance for students.",
                benefit_frequency="Annual",
                passed_criteria=[],
                failed_criteria=["Applicant occupation is Farmer (Not currently enrolled as a student)."],
                edge_case_flags=[],
                required_documents=["College Bonafide"],
                portal_url="https://scholarships.gov.in",
                application_mode="National Scholarship Portal",
                friction_score=3,
            )
        ]

        summary_text = (
            "नमस्ते रमेश जी! आपकी जानकारी के अनुसार आप किसान क्रेडिट कार्ड (KCC), पीएम-किसान सम्मान निधि "
            "और पीएम किसान मानधन पेंशन योजना सहित 5 प्रमुख सरकारी योजनाओं के लिए पूरी तरह पात्र हैं। "
            "इन योजनाओं से आपको कुल मिलाकर ₹7,42,000 तक का वित्तीय लाभ और क्रेडिट सहायता मिल सकती है। "
            "आवेदन का पहला कदम: अपने 7/12 खतौनी और आधार कार्ड के साथ नजदीकी सीएससी केंद्र (नासिक डिजिटल सेवा केंद्र #204) पर जाएं।"
        )

        csc_rec = {
            "center_name": "Nashik Digital Seva CSC Center #204",
            "vle_name": "Sanjay Shinde",
            "contact_phone": "+91 98220 54321",
            "address": "Near Gram Panchayat Bhavan, Dindori Road, Nashik, Maharashtra - 422003",
            "distance_km": 1.4,
            "simulated": True,
        }

        total_benefit = sum(s.benefit_amount_inr for s in eligible)

        return AgentResponse(
            user_profile=profile,
            eligible_schemes=eligible,
            review_schemes=review,
            ineligible_schemes=ineligible,
            total_potential_benefit_inr=total_benefit,
            summary_text=summary_text,
            vernacular_summary=summary_text,
            csc_recommendation=csc_rec,
            events=events,
        )


run_agent = run_stub_agent
