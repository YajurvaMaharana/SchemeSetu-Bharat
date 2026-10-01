"""Unit and integration tests for SchemeSetuAgent orchestrator and telemetry events.

RULES TESTED:
- Every agent step emits an AgentEvent for live telemetry.
- Simulated features (CSC locator, form submit) carry simulated=True.
- Full end-to-end execution without crashes.
"""

from typing import List
import pytest
from agent.events import AgentEvent
from agent.models import UserProfile
from agent.orchestrator import SchemeSetuAgent
from agent.simulated_tools import locate_nearest_csc, mock_portal_submission


def test_orchestrator_emits_telemetry_events():
    """Verify that every step of the agent emits an AgentEvent with correct properties."""
    agent = SchemeSetuAgent()
    captured_events: List[AgentEvent] = []

    def on_event(ev: AgentEvent):
        captured_events.append(ev)

    query = "मैं उत्तर प्रदेश से 36 वर्षीय किसान हूँ। 2.5 एकड़ जमीन है और सालाना आय 90000 रुपये है। पिनकोड 226001।"
    response = agent.run(query, on_event=on_event)

    # 1. Telemetry verification
    assert len(captured_events) >= 6, f"Expected at least 6 events, got {len(captured_events)}"

    steps_recorded = [e.step for e in captured_events]
    assert "PROFILE_EXTRACTION" in steps_recorded
    assert "DETERMINISTIC_RULES" in steps_recorded
    assert "SCHEME_RANKING" in steps_recorded
    assert "CSC_LOCATOR" in steps_recorded
    assert "EXPLANATION_GENERATION" in steps_recorded
    assert "DELIVER" in steps_recorded

    # 2. Simulated flag verification
    csc_events = [e for e in captured_events if e.step == "CSC_LOCATOR"]
    assert len(csc_events) >= 1
    assert all(e.simulated is True for e in csc_events), "CSC events must carry simulated=True"

    # 3. Response consistency
    assert response.user_profile.occupation == "farmer"
    assert response.user_profile.land_acres == 2.5
    assert response.user_profile.land_hectares == round(2.5 * 0.4047, 4)
    assert response.total_potential_benefit_inr > 0
    assert len(response.eligible_schemes) > 0
    assert response.csc_recommendation is not None
    assert response.csc_recommendation.get("simulated") is True


def test_simulated_tools_flags():
    """CSC locator and mock submission must explicitly carry simulated=True."""
    # Test CSC locator
    csc = locate_nearest_csc(pincode="110001", district="New Delhi")
    assert csc["simulated"] is True
    assert "distance_km" in csc
    assert "center_name" in csc

    # Test Mock Portal Submission
    profile = UserProfile(name="Ramesh Yadav", age=40, occupation="Farmer", annual_income_inr=75000)
    submission = mock_portal_submission(scheme_id="pm_kisan", profile=profile)
    assert submission["simulated"] is True
    assert "submission_id" in submission
    assert "acknowledgement_number" in submission


def test_agent_application_submission_telemetry():
    """Verify application submission emits simulated=True telemetry."""
    agent = SchemeSetuAgent()
    events: List[AgentEvent] = []

    profile = UserProfile(name="Sunita Devi", age=34, occupation="Farmer", annual_income_inr=60000)
    receipt = agent.submit_application("pm_kisan", profile, on_event=lambda e: events.append(e))

    assert receipt["simulated"] is True
    assert len(events) >= 2
    assert all(e.simulated is True for e in events)
    assert any(e.step == "MOCK_SUBMISSION" for e in events)
