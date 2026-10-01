# 🏛️ YojnaSathi (योजना साथी)
### Autonomous Multilingual AI Agent for Last-Mile Welfare Discovery, Verification & Action

[![Hackathon](https://img.shields.io/badge/BHARAT_AGENTIC_2026-1_Oct_2026-orange.svg)](https://unstop.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Built with Antigravity](https://img.shields.io/badge/Agent-Google_Antigravity-4285F4.svg)](#)

---

## 📌 1. Executive Summary & Problem Context

Over **60% of eligible Indian citizens** fail to claim their entitlements under Central and State welfare programs, leaving an estimated **₹3–5 Lakh Crore ($35B–$60B) in unclaimed subsidies annually**.

### Key Systemic Bottlenecks:
1. **Scattered Scheme Architecture:** Rules are dispersed across dozens of portals (MyScheme, state portals, direct ministry portals).
2. **Linguistic Exclusion:** Documentation and portals are primarily formatted in English or formal administrative Hindi.
3. **Information Asymmetry:** Citizens do not know which combinations of land records (Khasra/Khatauni), caste certificates, or income slabs unlock specific benefits.
4. **Chatbot Dead-Ends:** Existing bots provide generic text answers without verifying eligibility, compiling documents, locating physical access points, or filling out forms.

**SchemeSetu Bharat** replaces passive chatbots with an **autonomous closed-loop AI agent** built in Google Antigravity that executes the complete cycle:
$$\text{Understand} \longrightarrow \text{Reason} \longrightarrow \text{Plan} \longrightarrow \text{Use Tools} \longrightarrow \text{Act} \longrightarrow \text{Deliver}$$

---

## ⚖️ 2. Alignment with Hackathon Judging Criteria

| Judging Criterion | How SchemeSetu Bharat Delivers | Evidence / Implementation |
| :--- | :--- | :--- |
| **Agentic Capability** | Autonomous multi-step tool execution without human-in-the-loop branching. Plans sub-tasks, calls external verification tools, recovers from missing data, and triggers actions. | Implemented via Google Antigravity orchestrator with explicit JSON tool schemas. |
| **Bharat Impact** | Directly unlocks welfare capital (PM-KISAN, Ayushman Bharat, PMAY, NSP, KCC) for Tier-2/3/rural citizens, smallholder farmers, and blue-collar families. | Covers 6 flagship central/state schemes impacting >200M households. |
| **Technical Implementation** | Hybrid deterministic rule engine + LLM reasoning, structured JSON tool execution, automated PDF generation, and vernacular audio processing. | Python 3.10+, Antigravity SDK, Gemini 1.5 Flash, ReportLab/FPDF2, Streamlit. |
| **Innovation** | Shifts civic tech from "search and read" to "autonomous verification and end-to-end application generation." | Dynamic CSC geolocation finder + instant downloadable offline action roadmap. |
| **User Experience** | Zero-friction vernacular voice input with high-contrast UI tailored for mobile screens and low-literacy users. | Multilingual input (Hindi/Marathi/English) and voice summary output. |
| **Scalability & Feasibility** | Stateless micro-agent architecture deployable across Common Service Centres (CSCs), WhatsApp bots, or Gram Panchayat kiosks. | Schema-driven design; adding new state schemes requires only updating `schemes_data.json`. |
| **Live Demo** | Complete 60-second end-to-end execution: voice query in Hindi → structured telemetry logs → matched schemes → downloadable PDF roadmap. | Live demo video and working Streamlit web interface. |

---

## 🧠 3. Core Agent Flow (Architecture)
YojnaSathi operates across six deterministic stages:

┌─────────────────────────────────┐
│           UNDERSTAND            │ ➔ Multilingual intent & attribute extraction
└────────────────┬────────────────┘   (Income, Landholding, Category, State)
                 │
                 ▼
┌─────────────────────────────────┐
│             REASON              │ ➔ Deterministic rule-checking against
└────────────────┬────────────────┘   statutory welfare thresholds (BPL, Khasra)
                 │
                 ▼
┌─────────────────────────────────┐
│              PLAN               │ ➔ Rank schemes by benefit value (₹)
└────────────────┬────────────────┘   and generate resolution dependencies
                 │
                 ▼
┌─────────────────────────────────┐
│            USE TOOLS            │ ➔ • query_scheme_database()
└────────────────┬────────────────┘   • locate_nearest_csc()
                 │                    • generate_application_checklist()
                 ▼
┌─────────────────────────────────┐
│               ACT               │ ➔ Pre-fill mock portal application payload
└────────────────┬────────────────┘   and compile PDF action plan
                 │
                 ▼
┌─────────────────────────────────┐
│             DELIVER             │ ➔ Ready-to-file PDF Roadmap + Voice Summary
└─────────────────────────────────┘   + Direct link to verified CSC desk

## 🛠️ 4. Tools & Integrations

The Antigravity agent controls four custom tools:

1. **`evaluate_eligibility(user_profile)`**: Cross-checks income, land size, age, and state against structured scheme schemas (`schemes_data.json`).
2. **`locate_nearest_csc(pincode, district)`**: Queries geolocation data to provide the exact physical address, VLE (Village Level Entrepreneur) contact, and distance to the nearest Common Service Centre.
3. **`generate_action_pdf(matched_data)`**: Uses ReportLab to generate a clean, official Hindi/English PDF listing matched benefits, necessary KYC documents, and step-by-step submission instructions.
4. **`mock_portal_submission(scheme_id, citizen_payload)`**: Simulates an automated browser/API payload submission to government portals (e.g., PM-KISAN or National Scholarship Portal).

---

## 📁 5. Repository Structure

```text
SchemeSetu-Bharat/
├── app.py                      # Interactive Streamlit Web Interface
├── requirements.txt            # Project dependencies
├── schemes_data.json           # Knowledge base for flagship welfare schemes
├── agent/
│   ├── __init__.py
│   ├── orchestrator.py         # Antigravity agent definition & reasoning graph
│   └── prompts.py              # System prompts & vernacular grounding
├── tools/
│   ├── __init__.py
│   ├── eligibility_engine.py   # Hybrid rule & criteria evaluation
│   ├── csc_locator.py          # Geolocation & CSC directory lookup
│   └── pdf_generator.py        # PDF Roadmap export tool
└── docs/
    ├── architecture.png        # System architecture diagram
    └── demo_script.md          # 2-minute pitch & evaluation guide
```
## 🚀 6. Quickstart & Installation

Follow these steps to set up and run **YojanaSathi** locally:

### Prerequisites
* Python 3.10+ or Node.js 18+ (depending on your environment)
* Valid API keys for Groq/OpenAI, Bhashini (optional), and Google Maps Places API

### 1. Clone the Repository
```bash
git clone [https://github.com/YajurvaMaharana/YojnaSathi.git](https://github.com/YajurvaMaharana/YojnaSathi.git)
cd YojnaSathi
```
2. Configure Environment Variables
Copy the example environment file and add your credentials:
cp .env.example .env
Fill in the required keys in .env:
GROQ_API_KEY=your_groq_api_key_here
BHASHINI_API_KEY=your_bhashini_key_here
GOOGLE_MAPS_API_KEY=your_places_api_key_here

3. Install Dependencies
  pip install -r requirements.txt
4. Launch the Application
   streamlit run app.py 

🛠️ 7. Technology StackLLM Reasoning Engine: Llama 3.1 / GPT-4o via Groq for ultra-low-latency deterministic routing   Orchestration: LangChain / LlamaIndex agent workflow   Vernacular Voice & Translation: Bhashini Indic API & Whisper for interrupt-driven dialect processing (Bhojpuri, Marwari, Maithili, Hinglish)   Vision & Extraction: Tesseract OCR / Google Vision API for identity and landholding record verification   Portal Automation: Playwright / Selenium for automated form filling across public schemes   Geolocation & Mapping: Google Maps Places API for locating the nearest verified Common Service Centres (CSCs) with queue prediction   Document Compilation: ReportLab / FPDF for generating instant downloadable PDF roadmaps   ⏱️ 8. Demo Pitch Script (2 Minutes)

## ⏱️ 8. Demo Pitch Script (2 Minutes)

| Timestamp | Screen / Flow | Action & Narration |
|---|---|---|
| **0:00 - 0:30** | **Vernacular Voice Input** | Citizen speaks in Bhojpuri describing flood damage. YojanaSathi instantly responds in dialect with PM Fasal Bima eligibility. |
| **0:30 - 1:00** | **Family Optimizer Engine** | Shows dynamic dashboard: *"Ramesh's household is eligible for ₹4.5 lakh over 5 years across 7 combined schemes."* |
| **1:00 - 1:30** | **Multi-Step Autopilot** | One-click auto-fill populates all 25+ application parameters on the mock portal in 20 seconds and retrieves an Application ID. |
| **1:30 - 2:00** | **Proactive Notification & CSC Booking** | System detects upcoming scholarship deadline for daughter, |

## 🏆 9. Competitive Advantage

| Capability | Jugalbandi | myScheme | Saarthi AI |
|---|---|---|---|
| **Eligibility Checker** | Yes | Yes | Yes |
| **Language Coverage** | 10 Languages | EN / HI only | Multilingual |
| **Voice Interface** | Audio only | No | Conversational |
| **Form Filling** | No | No | Limited |
| **Document Pre-Verification** | No | No | Yes |
|Status & Grievance**| No | Manual |Basic |Automated 60-Day RTI & Escalation Bot |
|Ground**| Support |No | No | No |

👥 10. Mission
"YojanaSathi — ApnaAdhikar: Ensuring no citizen is left behind from claiming what is rightfully theirs."
