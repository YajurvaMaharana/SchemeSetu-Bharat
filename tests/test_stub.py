"""Tests for offline / heuristic stub agent."""

from agent.models import AgentEvent, AgentResult, CitizenProfile
from agent.stub import run_agent


def test_stub_agent_execution():
    events_recorded = []

    def on_event(ev: AgentEvent):
        events_recorded.append(ev)

    result = run_agent(
        user_text="मैं नासिक से रमेश हूँ, किसान हूँ",
        language="hi",
        on_event=on_event,
    )

    assert isinstance(result, AgentResult)
    assert isinstance(result.profile, CitizenProfile)

    # 1. Profile checks
    assert result.profile.name == "Ramesh"
    assert result.profile.occupation == "farmer"
    assert result.profile.district == "Nashik"
    assert result.profile.state == "Maharashtra"
    assert result.profile.land_hectares == 1.2
    assert result.profile.annual_income_inr == 85000

    # 2. Matches checks
    assert len(result.matches) == 6
    eligible_ids = [m.scheme_id for m in result.matches if m.status == "ELIGIBLE"]
    assert "pm_kisan" in eligible_ids
    assert "kcc" in eligible_ids
    assert len(eligible_ids) == 2

    not_eligible_ids = [m.scheme_id for m in result.matches if m.status == "NOT_ELIGIBLE"]
    assert len(not_eligible_ids) == 4

    # 3. Benefits & CSC
    assert result.total_annual_benefit_inr == 306000
    assert result.csc_center is not None
    assert result.csc_center.get("simulated") is True
    assert "pm_kisan" in result.application_payloads
    assert result.application_payloads["pm_kisan"].get("simulated") is True
    assert result.pdf_path is None

    # 4. Telemetry events check: 8 scripted events
    assert len(events_recorded) == 8
    assert len(result.events) == 8
