"""CLI runner for SchemeSetu Bharat agent execution.

Demonstrates multilingual welfare discovery across Hindi (hi), Marathi (mr), and English (en),
printing full live telemetry events, application pre-filing, Action Pack PDF paths,
and the three localized citizen explanations.
"""

from datetime import datetime
import os
from pathlib import Path
import sys

# Ensure UTF-8 output on Windows terminal
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure repo root is on python path
repo_root = Path(__file__).resolve().parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from agent.agent import run_agent
from agent.models import AgentEvent, AgentResult


def cli_event_handler(event: AgentEvent) -> None:
    """Print-based live telemetry event handler for terminal display."""
    kind_upper = str(event.kind).upper()
    sim_badge = " [SIMULATED]" if getattr(event, "simulated", False) else ""

    icons = {
        "THOUGHT": "💭",
        "TOOL_CALL": "⚙️ ",
        "TOOL_RESULT": "📋",
        "FINAL": "🎉",
        "ERROR": "❌",
    }
    icon = icons.get(kind_upper, "🔹")
    ts = getattr(event, "timestamp", "") or datetime.now().strftime("%H:%M:%S")

    print(f"[{ts}] {icon} [{kind_upper}]{sim_badge} {event.title}: {event.detail}")


def run_single_language(sentence: str, lang_code: str, lang_name: str, verbose_events: bool = True) -> AgentResult:
    """Run the agent for a specific language query and display results."""
    print("=" * 80)
    print(f"🏛️  SCHEMESETU BHARAT — {lang_name.upper()} ({lang_code}) DISCOVERY")
    print("=" * 80)
    print(f"Query: \"{sentence}\"\n")
    print("-" * 80)
    print("LIVE AGENT TELEMETRY EVENTS:")
    print("-" * 80)

    cb = cli_event_handler if verbose_events else None
    result: AgentResult = run_agent(
        user_text=sentence,
        language=lang_code,
        on_event=cb,
        auto_submit=True,
    )

    print("-" * 80)
    print(f"EXECUTIVE SUMMARY ({lang_name}):")
    print("-" * 80)

    prof = result.profile
    print(f"Citizen Name      : {prof.name or 'Ramesh'}")
    print(f"Occupation        : {prof.occupation} (Age: {prof.age})")
    print(f"Location          : {prof.district}, {prof.state}")
    print(f"Annual Income     : Rs. {int(prof.annual_income_inr or 0):,}")
    print(f"Agricultural Land : {prof.land_hectares} ha ({round((prof.land_hectares or 0) / 0.4047, 1)} acres)")
    print(f"Total Benefit     : Rs. {result.total_annual_benefit_inr:,} per year")
    print(f"Used Fallback     : {result.used_fallback}")

    print("\nEligible Schemes Discovered:")
    eligible_count = 0
    for match in result.matches:
        if match.status == "ELIGIBLE":
            eligible_count += 1
            print(f"  {eligible_count}. {match.name}")
            print(f"     • Annual Value : Rs. {match.annual_benefit_inr:,}")
            print(f"     • Friction Score: {'⭐' * match.friction_score} ({match.friction_score}/5)")
            print(f"     • Required Docs: {', '.join(match.required_documents[:3])}")
            print(f"     • Portal URL   : {match.portal_url}")

    if result.csc_center:
        print("\nNearest CSC Digital Seva Kendra [Simulated]:")
        print(f"  • Center Name : {result.csc_center.get('center_name')}")
        print(f"  • Distance    : {result.csc_center.get('distance_km')} km")
        print(f"  • Address     : {result.csc_center.get('address')}")
        print(f"  • VLE Contact : {result.csc_center.get('vle_name')} ({result.csc_center.get('contact_phone')})")

    if result.application_payloads:
        print("\nPre-Filed Application Payloads [Simulated]:")
        for sid, app in result.application_payloads.items():
            ack = app.get("submission_acknowledgement", {}).get("acknowledgement_id") or app.get("acknowledgement_number", "ACK-PENDING")
            print(f"  • {sid}: Ref {app.get('submission_id', sid)} (Ack ID: {ack})")

    if result.pdf_path and os.path.exists(result.pdf_path):
        size_bytes = os.path.getsize(result.pdf_path)
        print(f"\nCitizen Action Pack PDF:\n  • File Path   : {result.pdf_path} ({size_bytes:,} bytes)")

    print(f"\nVernacular Explanation ({lang_name}):")
    print(f"  \"{result.explanation}\"")
    print("=" * 80 + "\n")

    return result


def main() -> None:
    test_cases = [
        (
            "नमस्ते, मैं रमेश हूँ, 40 साल का किसान, नासिक महाराष्ट्र से। मेरी सालाना आय 1.5 लाख है और 1.5 एकड़ जमीन है। पक्का मकान है।",
            "hi",
            "Hindi (हिन्दी)",
        ),
        (
            "नमस्कार, मी रमेश आहे, ४० वर्षांचा शेतकरी, नाशिक महाराष्ट्रातून. माझे वार्षिक उत्पन्न १.५ लाख रुपये असून १.५ एकर शेतजमीन आहे. पक्के घर आहे.",
            "mr",
            "Marathi (मराठी)",
        ),
        (
            "Hello, I am Ramesh, a 40-year-old farmer from Nashik, Maharashtra. My annual income is 1.5 lakh INR and I own 1.5 acres of agricultural land with a pucca house.",
            "en",
            "English",
        ),
    ]

    results = []
    for sentence, lang_code, lang_name in test_cases:
        res = run_single_language(sentence, lang_code, lang_name, verbose_events=True)
        results.append((lang_name, res.explanation))

    print("\n" + "#" * 80)
    print("📋 SUMMARY OF THE THREE CITIZEN EXPLANATIONS (HI, MR, EN):")
    print("#" * 80)
    for lang_name, exp in results:
        print(f"\n[{lang_name}]:")
        print(f"\"{exp}\"")
    print("\n" + "#" * 80)


if __name__ == "__main__":
    main()
