"""SchemeSetu Bharat main autonomous agent execution engine.

Implements the multi-stage discovery flow with Gemini function-calling and deterministic fallback:
1. Understanding citizen profile (extract_profile).
2. Function-calling loop with tools (evaluate_eligibility, calc_benefits, find_csc, build_application_payload, make_pdf).
3. Plain language citizen explanation (explain_results).
4. Deterministic fallback pipeline if Gemini call fails, times out, or skips required tools.
5. Saves last successful result to data/demo_cache.json for demo resilience.
"""

from datetime import datetime
import json
import logging
import os
from pathlib import Path
import time
from typing import Any, Callable, Dict, List, Optional, Union

from dotenv import load_dotenv
from google.genai import types

from agent import llm, rules, tools
from agent.guardrails import validate_result
from agent.models import AgentEvent, AgentResult, CitizenProfile, SchemeMatch, UserProfile
from agent.prompts import SYSTEM_PROMPTS

load_dotenv()
logger = logging.getLogger(__name__)


def get_agent_system_prompt(language: str = "hi", auto_submit: bool = False) -> str:
    """Generate dynamic system prompt with vernacular framing and optional auto-submit instructions."""
    lang_key = "mr" if language.lower() in ("mr", "marathi") else ("en" if language.lower() in ("en", "english") else "hi")
    vernacular_intro = SYSTEM_PROMPTS.get(lang_key, SYSTEM_PROMPTS["hi"])

    steps = [
        "1. evaluate_eligibility: Evaluate citizen eligibility against all government welfare schemes.",
        "2. calc_benefits: Calculate total annual monetary benefit from eligible schemes.",
        "3. find_csc: Discover the nearest CSC Digital Seva Kendra desk for biometric verification.",
        "4. build_application_payload: Build pre-filed application payload for each ELIGIBLE scheme.",
    ]
    if auto_submit:
        steps.append("5. mock_portal_submit: Submit pre-filed application payload directly to official portal API.")
        steps.append("6. make_pdf: Generate the Action Pack PDF summary for the citizen.")
        steps.append("7. Once all tools have completed, stop and respond with 'DONE'.")
    else:
        steps.append("5. make_pdf: Generate the Action Pack PDF summary for the citizen.")
        steps.append("6. Once all tools have completed, stop and respond with 'DONE'.")

    steps_text = "\n".join(steps)

    return (
        f"{vernacular_intro}\n\n"
        f"You are SchemeSetu, an autonomous welfare discovery and application agent for Indian citizens. "
        f"Your objective is to help the citizen discover all government welfare schemes they qualify for, "
        f"calculate their total monetary benefits, locate the nearest CSC center for biometric verification, "
        f"build application payloads for each ELIGIBLE scheme, and generate an Action Pack PDF.\n\n"
        f"You must execute these tools in order:\n"
        f"{steps_text}\n\n"
        f"CRITICAL RULE: Never invent eligibility verdicts. The deterministic output of evaluate_eligibility is the sole truth."
    )


def run_agent(
    user_text: Union[str, CitizenProfile, UserProfile],
    language: str = "hi",
    on_event: Optional[Callable[[AgentEvent], None]] = None,
    auto_submit: bool = False,
    **kwargs: Any,
) -> AgentResult:
    """Run the SchemeSetu welfare agent on a citizen query or profile.
    
    Args:
        user_text: Citizen natural language text query or already instantiated profile.
        language: Language code for communication ('hi', 'mr', 'en'). Defaults to 'hi'.
        on_event: Optional callback receiving live AgentEvent telemetry.
        auto_submit: If True, automatically invokes mock_portal_submit for eligible schemes. Defaults to False.
        
    Returns:
        AgentResult object containing matched schemes, benefits, CSC desk, PDF path, and event history.
    """
    events: List[AgentEvent] = []

    def emit(
        kind: str,
        title: str,
        detail: str,
        status: str = "IN_PROGRESS",
        data: Optional[Dict[str, Any]] = None,
        simulated: bool = False,
    ) -> None:
        """Create and emit an AgentEvent to history and live callback."""
        event = AgentEvent(
            kind=kind,
            title=title,
            detail=detail,
            step=title,
            status=status,
            message=detail,
            data=data,
            simulated=simulated,
            timestamp=datetime.now().strftime("%H:%M:%S"),
        )
        events.append(event)
        if on_event:
            try:
                on_event(event)
            except Exception as e:
                logger.warning(f"Error in on_event callback: {e}")

    # Step 1: Understand citizen profile
    emit("thought", "Profile Extraction", f"Understanding citizen profile ({language})...")

    if isinstance(user_text, (CitizenProfile, UserProfile)):
        profile = CitizenProfile.model_validate(user_text.model_dump())
        query_str = user_text.name or "Citizen profile provided directly."
    else:
        query_str = str(user_text)
        profile = llm.extract_profile(query_str, language=language)

    profile.language = language
    prof_dict = profile.model_dump()

    occ_desc = profile.occupation or "Citizen"
    age_desc = f"{profile.age} yrs" if profile.age else "Age unstated"
    inc_desc = f"₹{profile.annual_income_inr:,}" if profile.annual_income_inr else "Income unstated"
    land_desc = f"{profile.land_hectares} ha" if profile.land_hectares else "Landless/Unstated"

    emit(
        "tool_result",
        "Profile Extracted",
        f"Parsed Profile: {occ_desc}, {age_desc}, Income: {inc_desc}, Land: {land_desc}, District: {profile.district or 'General'}",
        status="COMPLETED",
        data=prof_dict,
    )

    # State variables tracked across tool calls
    matches_dict_list: List[Dict[str, Any]] = []
    total_benefit: int = 0
    csc_data: Optional[Dict[str, Any]] = None
    application_payloads: Dict[str, Dict[str, Any]] = {}
    last_mock_submission: Optional[Dict[str, Any]] = None
    pdf_path: Optional[str] = None
    used_fallback: bool = False

    # Check if we should attempt Gemini function calling
    force_fallback = (
        os.getenv("USE_STUB", "0") == "1"
        or not os.getenv("GEMINI_API_KEY", "").strip()
    )

    if not force_fallback:
        try:
            client = llm.get_genai_client(timeout_secs=20.0)
            if client is None:
                raise RuntimeError("Gemini client initialization returned None.")

            available_tools_map = {
                "evaluate_eligibility": tools.evaluate_eligibility,
                "calc_benefits": tools.calc_benefits,
                "find_csc": tools.find_csc,
                "build_application_payload": tools.build_application_payload,
                "make_pdf": tools.make_pdf,
                "mock_portal_submit": tools.mock_portal_submit,
            }

            tool_list = [
                tools.evaluate_eligibility,
                tools.calc_benefits,
                tools.find_csc,
                tools.build_application_payload,
                tools.make_pdf,
            ]
            if auto_submit:
                tool_list.append(tools.mock_portal_submit)

            agent_system_prompt = get_agent_system_prompt(language=language, auto_submit=auto_submit)

            config = types.GenerateContentConfig(
                system_instruction=agent_system_prompt,
                tools=tool_list,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
                temperature=0.0,
            )

            contents: List[Any] = [
                f"Citizen Query: {query_str}\n\nStructured Citizen Profile JSON:\n{profile.model_dump_json(indent=2)}"
            ]

            max_iterations = 8
            for iteration in range(max_iterations):
                logger.info(f"Agent function-calling iteration {iteration + 1}/{max_iterations}...")
                resp = client.models.generate_content(
                    model=llm.GEMINI_MODEL,
                    contents=contents,
                    config=config,
                )

                if not resp.function_calls:
                    # Model provided text response indicating completion
                    logger.info("No further function calls requested by model.")
                    break

                for call in resp.function_calls:
                    tool_name = call.name
                    tool_args = call.args or {}

                    emit(
                        "thought",
                        f"Planning {tool_name}",
                        f"Autonomous decision to invoke {tool_name} for citizen welfare discovery.",
                    )
                    emit(
                        "tool_call",
                        tool_name,
                        f"Executing {tool_name} with parameters: {list(tool_args.keys())}",
                    )

                    fn = available_tools_map.get(tool_name)
                    if not fn:
                        raise ValueError(f"Model requested unknown tool '{tool_name}'")

                    res_payload = fn(**tool_args)

                    # Update tracked state
                    if tool_name == "evaluate_eligibility":
                        matches_dict_list = res_payload.get("matches", [])
                        el_count = sum(1 for m in matches_dict_list if m.get("status") == "ELIGIBLE")
                        summary = f"Evaluated {len(matches_dict_list)} schemes. Qualified for {el_count} schemes."
                        is_sim = False
                    elif tool_name == "calc_benefits":
                        total_benefit = int(res_payload.get("total_annual_benefit_inr", 0))
                        summary = f"Total annual unlocked financial assistance: ₹{total_benefit:,}"
                        is_sim = False
                    elif tool_name == "find_csc":
                        csc_data = res_payload
                        summary = f"Discovered center: {csc_data.get('center_name')} ({csc_data.get('distance_km')} km away)"
                        is_sim = True
                    elif tool_name == "build_application_payload":
                        sid = tool_args.get("scheme_id", "SCHEME")
                        application_payloads[sid] = res_payload
                        summary = f"Application payload pre-filed for {sid} (Status: {res_payload.get('status')})"
                        is_sim = True
                    elif tool_name == "mock_portal_submit":
                        last_mock_submission = res_payload
                        summary = f"Pre-filed to portal [Simulated]: Ack {res_payload.get('acknowledgement_id')}"
                        is_sim = True
                    elif tool_name == "make_pdf":
                        pdf_path = res_payload.get("pdf_path")
                        summary = f"Action Pack PDF generated at: {pdf_path}"
                        is_sim = False
                    else:
                        summary = f"Completed execution of {tool_name}."
                        is_sim = False

                    emit("tool_result", tool_name, summary, simulated=is_sim, data=res_payload)

                    # Append to conversational context
                    contents.append(resp.candidates[0].content)
                    contents.append(types.Part.from_function_response(name=tool_name, response={"result": res_payload}))

            # Validate that core workflow produced required deliverables
            if not matches_dict_list or not csc_data or not pdf_path:
                logger.warning("Gemini function loop finished but missed required deliverables. Engaging fallback.")
                force_fallback = True

        except Exception as e:
            logger.warning(f"Gemini autonomous loop encountered error: {e}. Switching to deterministic pipeline.")
            force_fallback = True

    # Deterministic fallback pipeline
    if force_fallback or used_fallback or not matches_dict_list or not pdf_path:
        emit("thought", "Pipeline Adaptation", "Switching to deterministic pipeline")
        used_fallback = True

        # Tool 1: evaluate_eligibility
        emit("thought", "Evaluating Eligibility", "Evaluating profile against statutory welfare rules in database.")
        emit("tool_call", "evaluate_eligibility", f"Evaluating profile criteria for {profile.occupation or 'citizen'}.")
        elig_res = tools.evaluate_eligibility(prof_dict)
        matches_dict_list = elig_res.get("matches", [])
        el_schemes = [m.get("name") or m.get("scheme_id") for m in matches_dict_list if m.get("status") == "ELIGIBLE"]
        emit(
            "tool_result",
            "evaluate_eligibility",
            f"Evaluated {len(matches_dict_list)} schemes. Qualified for {len(el_schemes)}: {', '.join(el_schemes[:3]) if el_schemes else 'None'}",
            data=elig_res,
        )

        # Tool 2: calc_benefits
        emit("thought", "Calculating Benefits", "Aggregating total annual financial assistance from eligible schemes.")
        emit("tool_call", "calc_benefits", f"Calculating total benefit for {len(matches_dict_list)} matches.")
        ben_res = tools.calc_benefits(matches_dict_list)
        total_benefit = ben_res.get("total_annual_benefit_inr", 0)
        emit("tool_result", "calc_benefits", f"Total annual benefit unlocked: ₹{total_benefit:,}", data=ben_res)

        # Tool 3: find_csc
        emit("thought", "Locating Nearest CSC", f"Locating nearest Digital Seva Kendra for district '{profile.district or profile.state or 'Local'}'.")
        emit("tool_call", "find_csc", f"Searching district='{profile.district}', pin='{profile.pin_code}'")
        csc_data = tools.find_csc(district=profile.district, pin_code=profile.pin_code, state=profile.state)
        emit(
            "tool_result",
            "find_csc",
            f"Nearest Center: {csc_data.get('center_name')} ({csc_data.get('distance_km')} km)",
            simulated=True,
            data=csc_data,
        )

        # Tool 4: build_application_payload for each ELIGIBLE scheme
        for m in matches_dict_list:
            if m.get("status") == "ELIGIBLE":
                sid = m.get("scheme_id") or m.get("id", "")
                emit("thought", "Building Application", f"Preparing pre-filled portal submission payload for {m.get('name') or sid}.")
                emit("tool_call", "build_application_payload", f"Building application for {sid}")
                payload = tools.build_application_payload(sid, prof_dict)
                application_payloads[sid] = payload
                emit(
                    "tool_result",
                    "build_application_payload",
                    f"Pre-filed application ready: ID {payload.get('submission_id', payload.get('scheme_id'))}",
                    simulated=True,
                    data=payload,
                )

        # Tool 4b: mock_portal_submit for each application payload if auto_submit is True
        if auto_submit:
            for sid, payload in list(application_payloads.items()):
                emit(
                    "thought",
                    "Submitting Application",
                    f"Auto-submitting pre-filed application for {payload.get('scheme_name', sid)} to government portal API.",
                )
                emit("tool_call", "mock_portal_submit", f"Submitting payload for {sid}")
                sub_res = tools.mock_portal_submit(payload)
                payload["submission_acknowledgement"] = sub_res
                last_mock_submission = sub_res
                emit(
                    "tool_result",
                    "mock_portal_submit",
                    f"Submitted [Simulated] Ack ID: {sub_res.get('acknowledgement_id')}",
                    simulated=True,
                    data=sub_res,
                )

        # Tool 5: make_pdf
        emit("thought", "Generating Action Pack", "Compiling matched schemes, required documents, and CSC contact into PDF.")
        emit("tool_call", "make_pdf", f"Creating citizen Action Pack in language '{language}'")
        pdf_res = tools.make_pdf(
            {
                "profile": prof_dict,
                "matches": matches_dict_list,
                "total_annual_benefit_inr": total_benefit,
                "csc_center": csc_data,
            },
            language=language,
        )
        pdf_path = pdf_res.get("pdf_path")
        emit("tool_result", "make_pdf", f"Action Pack PDF ready at: {pdf_path}", data=pdf_res)

    # Step 3: Explain results to citizen in friendly vernacular
    summary_for_explanation = {
        "citizen_name": profile.name or "Citizen",
        "occupation": profile.occupation,
        "district": profile.district or "General",
        "eligible_schemes": [
            m.get("name") or m.get("scheme_id") for m in matches_dict_list if m.get("status") == "ELIGIBLE"
        ],
        "total_annual_benefit_inr": total_benefit,
        "csc_name": csc_data.get("center_name") if csc_data else "Nearest CSC Digital Seva Kendra",
        "first_step": "Visit your nearest CSC center with your Aadhaar card for biometric authentication.",
    }
    explanation = llm.explain_results(summary_for_explanation, language=language)
    emit("final", "Discovery Complete", explanation, status="COMPLETED")

    # Step 5: Build initial AgentResult
    match_models = [SchemeMatch.model_validate(m) for m in matches_dict_list]
    result = AgentResult(
        profile=profile,
        matches=match_models,
        total_annual_benefit_inr=total_benefit,
        csc_center=csc_data,
        application_payloads=application_payloads,
        pdf_path=pdf_path,
        events=events,
        used_fallback=used_fallback,
        explanation=explanation,
        mock_submission=last_mock_submission,
    )

    # Step 6: Guardrail validation
    problems = validate_result(result)
    if problems:
        logger.error(f"Guardrail validation failed with {len(problems)} problem(s): {problems}")
        emit(
            "error",
            "Guardrail Validation Failure",
            f"Integrity check failed: {'; '.join(problems)}. Rerunning deterministic fallback.",
            status="ERROR",
            data={"problems": problems},
        )
        if not used_fallback:
            # Fall back to deterministic pipeline once
            used_fallback = True
            elig_res = tools.evaluate_eligibility(prof_dict)
            matches_dict_list = elig_res.get("matches", [])
            ben_res = tools.calc_benefits(matches_dict_list)
            total_benefit = ben_res.get("total_annual_benefit_inr", 0)
            csc_data = tools.find_csc(district=profile.district, pin_code=profile.pin_code, state=profile.state)
            pdf_res = tools.make_pdf(
                {
                    "profile": prof_dict,
                    "matches": matches_dict_list,
                    "total_annual_benefit_inr": total_benefit,
                    "csc_center": csc_data,
                },
                language=language,
            )
            pdf_path = pdf_res.get("pdf_path")
            explanation = llm.explain_results(summary_for_explanation, language=language)

            match_models = [SchemeMatch.model_validate(m) for m in matches_dict_list]
            result = AgentResult(
                profile=profile,
                matches=match_models,
                total_annual_benefit_inr=total_benefit,
                csc_center=csc_data,
                application_payloads=application_payloads,
                pdf_path=pdf_path,
                events=events,
                used_fallback=used_fallback,
                explanation=explanation,
                mock_submission=last_mock_submission,
            )

    # Save last successful result for demo safety cache
    try:
        cache_path = Path(__file__).resolve().parent.parent / "data" / "demo_cache.json"
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        with open(cache_path, "w", encoding="utf-8") as f:
            f.write(result.model_dump_json(indent=2))
        logger.info(f"Saved demo cache snapshot to {cache_path}")
    except Exception as e:
        logger.warning(f"Could not save demo cache: {e}")

    return result
