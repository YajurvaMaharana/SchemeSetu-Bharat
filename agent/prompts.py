"""Vernacular system prompts and localized UI strings for SchemeSetu Bharat.

Supports Hindi (hi), Marathi (mr), and simple English (en).
All vernacular prompts instruct the agent to communicate in simple class-6 reading level,
using proper Devanagari script for Hindi and Marathi.
"""

from typing import Dict

SYSTEM_PROMPTS: Dict[str, str] = {
    "hi": (
        "आप 'योजनासेतु भारत' (SchemeSetu Bharat) हैं, भारतीय नागरिकों के लिए एक मित्रवत, संवेदनशील और पारदर्शी कल्याण मार्गदर्शक।\n"
        "नागरिक को उनकी भाषा (सरल हिंदी, देवनागरी लिपि) में कक्षा-६ के पढ़ने के स्तर पर समझाएं।\n"
        "कठिन प्रशासनिक शब्दों का प्रयोग न करें।\n"
        "स्पष्ट रूप से बताएं:\n"
        "1. नागरिक किन सरकारी योजनाओं के लिए पात्र हैं।\n"
        "2. उन्हें प्रति वर्ष कुल कितने रुपये (₹) का सीधा आर्थिक लाभ मिलेगा।\n"
        "3. पहला कदम क्या है (नजदीकी सीएससी डिजिटल सेवा केंद्र पर आधार कार्ड और जरूरी कागजात लेकर जाना)।\n"
        "अधिकतम 120 शब्द रखें। पात्रता के नियमों का 100% पालन करें।"
    ),
    "mr": (
        "तुम्ही 'योजनासेतू भारत' (SchemeSetu Bharat) आहात, भारतीय नागरिकांसाठी एक विश्वासू, संवेदनशील आणि पारदर्शक कल्याणकारी मार्गदर्शक.\n"
        "नागरिकाला त्यांच्या भाषेत (सोपी मराठी, देवनागरी लिपी) ६वी इयत्तेच्या वाचन पातळीवर समजावून सांगा.\n"
        "कठीण किंवा प्रशासकीय शब्द वापरू नका.\n"
        "स्पष्टपणे सांगा:\n"
        "१. नागरिक कोणत्या सरकारी योजनांसाठी पात्र आहेत.\n"
        "२. त्यांना दरवर्षी एकूण किती रुपयांचा (₹) थेट आर्थिक लाभ मिळेल.\n"
        "३. पुढचे पहिले पाऊल काय आहे (जवळच्या सीएससी डिजिटल सेवा केंद्राला आधार कार्ड आणि आवश्यक कागदपत्रांसह भेट देणे).\n"
        "जास्तीत जास्त १२० शब्द ठेवा. नियमांचे काटेकोरपणे पालन करा."
    ),
    "en": (
        "You are 'SchemeSetu Bharat', a friendly, empathetic, and reliable welfare guide for Indian citizens.\n"
        "Communicate in clear, simple English at a 6th-grade reading level.\n"
        "Avoid administrative jargon.\n"
        "Clearly state:\n"
        "1. Which government welfare schemes the citizen qualifies for.\n"
        "2. The total annual financial assistance unlocked in integer Rupees (₹).\n"
        "3. The immediate first action step (visiting the nearest CSC Digital Seva Kendra with Aadhaar and required documents).\n"
        "Keep response under 120 words. Strictly honor deterministic eligibility rules."
    ),
}

# UI Strings for Streamlit Frontend & Localized CLI
UI_STRINGS: Dict[str, Dict[str, str]] = {
    "hi": {
        "app_title": "योजनासेतु भारत",
        "app_subtitle": "भारतीय नागरिकों के लिए स्वायत्त कल्याणकारी योजना खोज और आवेदन साथी",
        "input_label": "अपनी स्थिति अपनी भाषा में बताएं (बोलें या लिखें):",
        "input_placeholder": "उदा: मैं नासिक से किसान हूँ, 40 साल उम्र, 1.5 एकड़ जमीन और 1.5 लाख सालाना आय है...",
        "discover_btn": "🔍 मेरी सरकारी योजनाएं खोजें",
        "auto_submit_label": "सीधे सरकारी पोर्टल पर आवेदन अग्रिम दर्ज करें (सिम्युलेटेड)",
        "telemetry_header": "एजेंट विचार और वास्तविक समय टेलीमेट्री",
        "summary_header": "आपकी कल्याणकारी योजना रिपोर्ट",
        "total_benefit_title": "कुल वार्षिक आर्थिक लाभ",
        "eligible_heading": "✅ पात्र सरकारी योजनाएं",
        "review_heading": "⚠️ सत्यापन की आवश्यकता वाली योजनाएं",
        "ineligible_heading": "❌ अपात्र योजनाएं",
        "csc_header": "🏛️ नजदीकी ग्राहक सेवा केंद्र (सीएससी डिजिटल सेवा केंद्र)",
        "download_pdf": "📄 नागरिक एक्शन पैक (PDF) डाउनलोड करें",
        "friction_score": "आवेदन सुगमता स्तर",
        "required_docs": "आवश्यक दस्तावेज",
        "portal_link": "आधिकारिक सरकारी पोर्टल",
        "simulated_tag": "[सिम्युलेटेड / प्रतीकात्मक]",
    },
    "mr": {
        "app_title": "योजनासेतू भारत",
        "app_subtitle": "भारतीय नागरिकांसाठी स्वायत्त कल्याणकारी योजना शोध आणि अर्ज सहाय्यक",
        "input_label": "तुमची माहिती तुमच्या भाषेत सांगा (बोला किंवा लिहा):",
        "input_placeholder": "उदा: मी नाशिकचा शेतकरी आहे, वय ४० वर्ष, १.५ एकर शेती आणि वार्षिक उत्पन्न १.५ लाख रुपये आहे...",
        "discover_btn": "🔍 माझ्या सरकारी योजना शोधा",
        "auto_submit_label": "शासकीय पोर्टलवर थेट पूर्व-नोंदणी करा (सिम्युलेटेड)",
        "telemetry_header": "एजंट प्रक्रिया आणि थेट टेलिमेट्री",
        "summary_header": "तुमचा कल्याणकारी योजना अहवाल",
        "total_benefit_title": "एकूण वार्षिक आर्थिक लाभ",
        "eligible_heading": "✅ पात्र शासकीय योजना",
        "review_heading": "⚠️ कागदपत्र पडताळणी आवश्यक असलेल्या योजना",
        "ineligible_heading": "❌ अपात्र योजना",
        "csc_header": "🏛️ जवळचे ग्राहक सेवा केंद्र (सीएससी डिजिटल सेवा केंद्र)",
        "download_pdf": "📄 नागरिक ॲक्शन पॅक (PDF) डाउनलोड करा",
        "friction_score": "अर्ज सुलभता स्तर",
        "required_docs": "आवश्यक कागदपत्रे",
        "portal_link": "अधिकृत शासकीय संकेतस्थळ",
        "simulated_tag": "[सिम्युलेटेड / प्रात्यक्षिक]",
    },
    "en": {
        "app_title": "SchemeSetu Bharat",
        "app_subtitle": "Autonomous Welfare Discovery & Application Agent for Bharat",
        "input_label": "Describe your situation in your own words (Type or Speak):",
        "input_placeholder": "e.g., I am a farmer from Nashik, 40 years old, with 1.5 acres land and 1.5 lakh annual income...",
        "discover_btn": "🔍 Discover My Welfare Schemes",
        "auto_submit_label": "Pre-file application directly to government portals (Simulated)",
        "telemetry_header": "Agent Telemetry & Live Reasoning Stream",
        "summary_header": "Your Welfare Entitlement Summary",
        "total_benefit_title": "Total Annual Unlocked Benefit",
        "eligible_heading": "✅ Eligible Government Schemes",
        "review_heading": "⚠️ Schemes Requiring Document Verification",
        "ineligible_heading": "❌ Ineligible Schemes",
        "csc_header": "🏛️ Nearest CSC Digital Seva Kendra",
        "download_pdf": "📄 Download Citizen Action Pack (PDF)",
        "friction_score": "Application Ease",
        "required_docs": "Required Documents",
        "portal_link": "Official Government Portal",
        "simulated_tag": "[Simulated Action]",
    },
}
