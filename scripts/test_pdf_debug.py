import os
import sys

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from utils.pdf_generator_debug import generate_action_pack

def test():
    result = {
        "user_profile": {
            "name": "Ramesh",
            "district": "Nashik",
            "occupation": "Farmer",
            "annual_income_inr": 150000,
            "land_hectares": 0.6
        },
        "total_potential_benefit_inr": 42000,
        "summary_text": "You are eligible for PM-KISAN and PM-KMY. (English explanation)",
        "vernacular_summary": "आप पीएम-किसान और पीएम-केएमवाई के लिए पात्र हैं। (Hindi explanation)",
        "eligible_schemes": [
            {
                "scheme_name": "PM-KISAN",
                "benefit_amount_inr": 6000,
                "benefit_description": "Rs 6000 per year",
                "status": "ELIGIBLE",
                "passed_criteria": ["Farmer", "Land < 2 ha"],
                "required_documents": ["Aadhaar Card", "Bank Passbook", "Land Record (7/12)"],
                "portal_url": "https://pmkisan.gov.in"
            }
        ],
        "review_schemes": [],
        "csc_recommendation": {
            "center_name": "Nashik CSC Main",
            "address": "123 MG Road, Nashik, Maharashtra",
            "contact_phone": "9876543210",
            "operating_hours": "9 AM - 5 PM",
            "simulated": True
        }
    }
    
    out_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "output")
    
    for lang in ["en", "hi", "mr"]:
        # Change vernacular text for mr vs hi
        if lang == "mr":
            result["vernacular_summary"] = "तुम्ही PM-KISAN आणि PM-KMY साठी पात्र आहात. (Marathi explanation)"
        elif lang == "hi":
            result["vernacular_summary"] = "आप पीएम-किसान और पीएम-केएमवाई के लिए पात्र हैं। (Hindi explanation)"
            
        path = generate_action_pack(result, lang, out_dir=out_dir)
        print(f"Generated for {lang}: {path}")

if __name__ == "__main__":
    test()
