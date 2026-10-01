"""Short script to call agent stub and display live execution results."""

import sys
from agent.stub import run_agent

# Ensure UTF-8 output encoding for Windows terminal
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def handle_event(ev):
    print(f"[{ev.timestamp}] [{ev.kind.upper()}] {ev.title} -> {ev.detail[:70]}...")


if __name__ == "__main__":
    print("=== SchemeSetu Bharat Agent Stub Execution ===")
    result = run_agent(
        user_text="मैं नासिक से रमेश हूँ, 42 साल उम्र, किसान हूँ, 1.2 हेक्टेयर जमीन है।",
        language="hi",
        on_event=handle_event,
    )

    print("\n=== AGENT RESULT OUTPUT ===")
    p = result.profile
    print(f"Citizen Profile: {p.name}, {p.age} yrs, {p.gender}, Occupation: {p.occupation}")
    print(f"Location: {p.district}, {p.state} - PIN {p.pin_code}")
    print(f"Land: {p.land_hectares} ha, Income: Rs. {p.annual_income_inr:,}")
    print(f"Total Annual Benefit: Rs. {result.total_annual_benefit_inr:,}")

    print("\nScheme Matches:")
    for m in result.matches:
        rank_str = f" [Rank #{m.priority_rank}]" if m.priority_rank else ""
        print(f"  • {m.name}: {m.status}{rank_str} | Rs. {m.annual_benefit_inr:,} | Friction: {m.friction_score}/5")

    print("\nSimulated CSC Center:")
    print(f"  Name: {result.csc_center['center_name']}")
    print(f"  VLE: {result.csc_center['vle_name']} | Phone: {result.csc_center['contact_phone']}")
    print(f"  Address: {result.csc_center['address']} (Distance: {result.csc_center['distance_km']} km)")
    print(f"  Simulated: {result.csc_center.get('simulated')}")

    print(f"\nPre-filled Application Payloads: {list(result.application_payloads.keys())}")
    print(f"Total Telemetry Events: {len(result.events)}")
    print(f"\nExplanation:\n{result.explanation}")
