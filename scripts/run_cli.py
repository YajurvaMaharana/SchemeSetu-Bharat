"""CLI runner for SchemeSetu Bharat agent execution.

Runs the agent pipeline on Ramesh's golden profile query with live terminal telemetry
and prints the full event sequence and the generated Action Pack PDF path.
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


def main() -> None:
    ramesh_sentence = (
        "नमस्ते, मैं रमेश हूँ, 40 साल का किसान, नासिक महाराष्ट्र से। "
        "मेरी सालाना आय 1.5 लाख है और 1.5 एकड़ जमीन है। पक्का मकान है।"
    )

    print("=" * 80)
    print("🏛️  SCHEMESETU BHARAT — AUTONOMOUS WELFARE AGENT CLI")
    print("=" * 80)
    print(f"Input Query:\n\"{ramesh_sentence}\"\n")
    print("-" * 80)
    print("LIVE AGENT TELEMETRY EVENTS:")
    print("-" * 80)

    # Execute agent with live event streaming
    result: AgentResult = run_agent(
        user_text=ramesh_sentence,
        language="hi",
        on_event=cli_event_handler,
    )

    print("-" * 80)
    print("EXECUTIVE SUMMARY & DELIVERABLES:")
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
            print(f"  • {sid}: Ref {app.get('submission_id')} (Ack: {app.get('acknowledgement_number')})")

    print("\nCitizen Action Pack PDF:")
    if result.pdf_path and os.path.exists(result.pdf_path):
        size_bytes = os.path.getsize(result.pdf_path)
        print(f"  • File Path   : {result.pdf_path} ({size_bytes:,} bytes)")
    else:
        print(f"  • File Path   : {result.pdf_path} (File not found on disk)")

    print("\nVernacular Explanation:")
    print(f"  \"{result.explanation}\"")
    print("=" * 80)


if __name__ == "__main__":
    main()
