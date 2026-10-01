"""Orchestrator for SchemeSetu Bharat Agent.

Closed-loop lifecycle:
Understand -> Reason -> Review Edge Cases -> Plan & Rank -> Use Tools -> Act -> Deliver

RULES:
- Every agent step must emit an AgentEvent so the UI can show live telemetry.
- Eligibility decisions are strictly deterministic from Python reading data/schemes_data.json.
- LLM only extracts profile, reviews flagged edge cases, and writes explanations.
- Simulated features carry simulated=True.
"""

from typing import Any, Callable, Dict, Generator, List, Optional, Union

from agent.edge_case_reviewer import review_all_edge_cases
from agent.events import AgentEvent, AgentEventCallback
from agent.explainer import generate_explanations
from agent.models import (
    AgentResponse,
    EligibilityStatus,
    Scheme,
    SchemeEligibilityResult,
    UserProfile,
)
from agent.profile_extractor import extract_user_profile
from agent.rules_engine import evaluate_all_schemes, load_schemes_data
from agent.simulated_tools import mock_portal_submission
from utils.locator import find_csc
from utils.pdf_generator import generate_action_pack


class SchemeSetuAgent:
    """Autonomous Welfare Discovery and Application Agent for Bharat."""

    def __init__(self, data_path: Optional[str] = None):
        self.schemes: List[Scheme] = load_schemes_data(data_path)

    def run(
        self,
        query_or_profile: Union[str, UserProfile],
        pincode: Optional[str] = None,
        district: Optional[str] = None,
        language: Optional[str] = None,
        on_event: Optional[AgentEventCallback] = None,
    ) -> AgentResponse:
        """Execute complete closed-loop agent workflow and return AgentResponse with telemetry events."""
        events: List[AgentEvent] = []

        def emit(event: AgentEvent) -> None:
            events.append(event)
            if on_event:
                try:
                    on_event(event)
                except Exception:
                    pass

        # ---------------------------------------------------------
        # STAGE 1: UNDERSTAND (Profile Extraction)
        # ---------------------------------------------------------
        emit(
            AgentEvent(
                step="PROFILE_EXTRACTION",
                status="STARTING",
                message="Analyzing citizen query and extracting demographic attributes...",
            )
        )

        if isinstance(query_or_profile, str):
            profile = extract_user_profile(query_or_profile)
        else:
            profile = query_or_profile

        if pincode and not profile.pincode:
            profile.pincode = pincode
        if district and not profile.district:
            profile.district = district

        # Determine language selection ('hi', 'mr', 'en')
        lang = "hi"
        if language:
            l = str(language).lower().strip()
            if l in ("mr", "marathi"):
                lang = "mr"
            elif l in ("en", "english"):
                lang = "en"
            else:
                lang = "hi"
        elif getattr(profile, "preferred_language", None):
            pref = str(profile.preferred_language).lower().strip()
            if "marathi" in pref or pref == "mr":
                lang = "mr"
            elif "english" in pref or pref == "en":
                lang = "en"
            else:
                lang = "hi"
        elif getattr(profile, "language", None):
            l = str(profile.language).lower().strip()
            if l in ("mr", "marathi"):
                lang = "mr"
            elif l in ("en", "english"):
                lang = "en"
            else:
                lang = "hi"

        # Sync profile language fields
        if lang == "mr":
            profile.preferred_language = "Marathi"
            profile.language = "mr"
        elif lang == "en":
            profile.preferred_language = "English"
            profile.language = "en"
        else:
            profile.preferred_language = "Hindi"
            profile.language = "hi"

        emit(
            AgentEvent(
                step="PROFILE_EXTRACTION",
                status="COMPLETED",
                message=(
                    f"Profile extracted: Age={profile.age or 'N/A'}, Occupation={profile.occupation or 'General'}, "
                    f"Land={profile.land_hectares or 0.0} ha ({profile.land_acres or 0.0} acres), "
                    f"Income=₹{profile.annual_income_inr or 0:,}"
                ),
                data=profile.model_dump(),
            )
        )

        # ---------------------------------------------------------
        # STAGE 2: REASON (Deterministic Rules Engine)
        # ---------------------------------------------------------
        emit(
            AgentEvent(
                step="DETERMINISTIC_RULES",
                status="STARTING",
                message="Evaluating statutory eligibility rules against knowledge base...",
            )
        )

        eligible, review, ineligible = evaluate_all_schemes(profile, self.schemes)

        emit(
            AgentEvent(
                step="DETERMINISTIC_RULES",
                status="COMPLETED",
                message=(
                    f"Deterministic verification complete: {len(eligible)} eligible, "
                    f"{len(review)} require review, {len(ineligible)} not eligible."
                ),
                data={
                    "eligible_ids": [s.scheme_id for s in eligible],
                    "review_ids": [s.scheme_id for s in review],
                    "ineligible_ids": [s.scheme_id for s in ineligible],
                    "counts": {
                        "eligible": len(eligible),
                        "review": len(review),
                        "ineligible": len(ineligible),
                    },
                },
            )
        )

        # ---------------------------------------------------------
        # STAGE 3: EDGE CASE REVIEW (LLM within strict boundaries)
        # ---------------------------------------------------------
        if review:
            emit(
                AgentEvent(
                    step="EDGE_CASE_REVIEW",
                    status="STARTING",
                    message=f"Reviewing {len(review)} schemes flagged with edge conditions...",
                )
            )
            review = review_all_edge_cases(review, profile)
            emit(
                AgentEvent(
                    step="EDGE_CASE_REVIEW",
                    status="COMPLETED",
                    message=f"Edge case reviews formulated with statutory document resolution paths.",
                    data={"reviewed_schemes": [s.scheme_id for s in review]},
                )
            )
        else:
            emit(
                AgentEvent(
                    step="EDGE_CASE_REVIEW",
                    status="COMPLETED",
                    message="No borderline edge cases flagged; all statutory criteria clean.",
                )
            )

        # ---------------------------------------------------------
        # STAGE 4: PLAN & RANK (Sort by Monetary Benefit ₹)
        # ---------------------------------------------------------
        total_benefit = sum(s.benefit_amount_inr for s in eligible)
        emit(
            AgentEvent(
                step="SCHEME_RANKING",
                status="COMPLETED",
                message=f"Schemes ranked by benefit: ₹{total_benefit:,} in potential welfare capital unlocked.",
                data={
                    "total_benefit_inr": total_benefit,
                    "top_scheme": eligible[0].scheme_name if eligible else None,
                },
            )
        )

        # ---------------------------------------------------------
        # STAGE 5: ACTION TOOLS (CSC Locator via Member B's find_csc)
        # ---------------------------------------------------------
        emit(
            AgentEvent(
                step="CSC_LOCATOR",
                status="STARTING",
                message="Querying geolocation directory for nearest Common Service Centre...",
                simulated=True,
            )
        )
        csc_info = find_csc(
            district=profile.district,
            pin_code=profile.pincode or profile.pin_code,
            state=profile.state,
        )
        emit(
            AgentEvent(
                step="CSC_LOCATOR",
                status="COMPLETED",
                message=f"Located nearest CSC desk: {csc_info.get('center_name', 'CSC Central')} ({csc_info.get('distance_km', 2.4)} km away).",
                data=csc_info,
                simulated=True,
            )
        )

        # ---------------------------------------------------------
        # STAGE 5b: ACTION TOOLS (Action Pack PDF Generator via Member B)
        # ---------------------------------------------------------
        emit(
            AgentEvent(
                step="MAKE_PDF",
                status="STARTING",
                message=f"Compiling citizen Action Pack PDF in language '{lang}'...",
            )
        )
        pdf_payload = {
            "profile": profile,
            "user_profile": profile,
            "eligible_schemes": eligible,
            "matches": eligible,
            "total_annual_benefit_inr": total_benefit,
            "total_potential_benefit_inr": total_benefit,
            "csc_center": csc_info,
            "csc_recommendation": csc_info,
        }
        try:
            pdf_path = generate_action_pack(pdf_payload, language=lang)
            emit(
                AgentEvent(
                    step="MAKE_PDF",
                    status="COMPLETED",
                    message=f"Citizen Action Pack PDF generated successfully at: {pdf_path}",
                    data={"pdf_path": pdf_path, "language": lang},
                )
            )
        except Exception as e:
            pdf_path = None
            emit(
                AgentEvent(
                    step="MAKE_PDF",
                    status="WARNING",
                    message=f"Citizen Action Pack PDF generation failed: {e}",
                    data={"error": str(e)},
                )
            )

        # ---------------------------------------------------------
        # STAGE 6: DELIVER (Citizen Explanation & Action Roadmap)
        # ---------------------------------------------------------
        emit(
            AgentEvent(
                step="EXPLANATION_GENERATION",
                status="STARTING",
                message="Generating personalized action plan and vernacular explanations...",
            )
        )
        explanation_text = generate_explanations(profile, eligible, review)
        emit(
            AgentEvent(
                step="EXPLANATION_GENERATION",
                status="COMPLETED",
                message="Action plan and document checklist compiled.",
            )
        )

        # Final delivery event
        emit(
            AgentEvent(
                step="DELIVER",
                status="COMPLETED",
                message=f"Execution successful: {len(eligible)} eligible welfare schemes delivered.",
                data={
                    "total_benefit_inr": total_benefit,
                    "eligible_count": len(eligible),
                },
            )
        )

        return AgentResponse(
            user_profile=profile,
            profile=profile,
            eligible_schemes=eligible,
            review_schemes=review,
            ineligible_schemes=ineligible,
            matches=eligible + review + ineligible,
            total_potential_benefit_inr=total_benefit,
            total_annual_benefit_inr=total_benefit,
            summary_text=explanation_text,
            vernacular_summary=explanation_text,
            explanation=explanation_text,
            csc_recommendation=csc_info,
            csc_center=csc_info,
            pdf_path=pdf_path,
            events=events,
        )

    def submit_application(
        self,
        scheme_id: str,
        profile: UserProfile,
        on_event: Optional[AgentEventCallback] = None,
    ) -> Dict[str, Any]:
        """Trigger simulated mock portal submission with mandatory simulated=True."""
        start_event = AgentEvent(
            step="MOCK_SUBMISSION",
            status="STARTING",
            message=f"Initiating automated submission to government portal for scheme '{scheme_id}'...",
            simulated=True,
        )
        if on_event:
            on_event(start_event)

        result = mock_portal_submission(scheme_id, profile)

        done_event = AgentEvent(
            step="MOCK_SUBMISSION",
            status="COMPLETED",
            message=f"Simulated application submitted. Reference ID: {result['submission_id']}",
            data=result,
            simulated=True,
        )
        if on_event:
            on_event(done_event)

        return result


def run_agent(
    query_or_profile: Union[str, UserProfile],
    pincode: Optional[str] = None,
    district: Optional[str] = None,
    language: Optional[str] = None,
    on_event: Optional[AgentEventCallback] = None,
    **kwargs: Any,
) -> AgentResponse:
    """Convenience module-level runner function."""
    if callable(language) and on_event is None:
        on_event = language
        language = None
    elif callable(pincode) and on_event is None:
        on_event = pincode
        pincode = None

    agent = SchemeSetuAgent()
    return agent.run(
        query_or_profile,
        pincode=pincode,
        district=district,
        language=language,
        on_event=on_event,
    )

