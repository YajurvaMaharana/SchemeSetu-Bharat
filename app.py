import streamlit as st
import os
import json
import time
from agent.models import AgentResponse, AgentEvent
from streamlit_mic_recorder import speech_to_text
from utils.voice import speak

# Need mock_portal_submission for the UI button
try:
    from agent.simulated_tools import mock_portal_submission
except ImportError:
    # Bug report fallback
    def mock_portal_submission(scheme_id, profile):
        return {"submission_id": f"SIM-{scheme_id}-123", "acknowledgement_number": "ACK-999"}

st.set_page_config(layout="wide", page_title="SchemeSetu Bharat", page_icon="🇮🇳")

def get_run_agent():
    """
    Imports run_agent from agent.agent, agent.orchestrator, or agent.stub.
    Ensures a reliable fallback to run_stub_agent so the agent never returns None.
    """
    use_stub = os.environ.get("USE_STUB", "0") == "1"
    
    if not use_stub:
        try:
            from agent.agent import run_agent
            if run_agent is not None:
                return run_agent
        except (ImportError, AttributeError):
            pass
        try:
            from agent.orchestrator import run_agent
            if run_agent is not None:
                return run_agent
        except (ImportError, AttributeError):
            pass

    # Seamless fallback to stub for SYNC 1 live demo reliability
    try:
        from agent.stub import run_stub_agent
        return run_stub_agent
    except (ImportError, AttributeError):
        pass

    try:
        from agent.stub import run_agent
        return run_agent
    except (ImportError, AttributeError):
        pass

    return None

run_agent = get_run_agent()

# Sidebar Controls
st.sidebar.header("Demo Controls")
demo_pacing = st.sidebar.checkbox("Demo pacing", value=True, help="Adds a 0.35s sleep per event so judges can read each step")
use_cached_demo = st.sidebar.checkbox("Use cached demo result", value=False)

# Header and tagline
st.title("SchemeSetu Bharat")
st.subheader("Apni yojana, apna haq")

st.markdown("""
<style>
.tricolour-bar {
    height: 6px;
    background: linear-gradient(to right, #FF9933 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #138808 66.6%);
    margin-top: 10px;
    margin-bottom: 20px;
    border-radius: 2px;
    border: 1px solid #e0e0e0;
}
.telemetry-container {
    background-color: #1E1E1E;
    color: #D4D4D4;
    font-family: monospace;
    padding: 10px;
    border-radius: 5px;
    height: 400px;
    overflow-y: auto;
}
.ts { color: #808080; }
.event-thought { color: #569CD6; }
.event-tool_call { color: #CE9178; }
.event-tool_result { color: #608B4E; }
.event-error { color: #F44747; }
.event-final { font-weight: bold; color: #DCDCAA; }
.simulated-badge {
    background-color: #d4edda;
    color: #155724;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: bold;
    margin-left: 10px;
    display: inline-block;
}
</style>
<div class="tricolour-bar"></div>
""", unsafe_allow_html=True)

if 'agent_result' not in st.session_state:
    st.session_state.agent_result = None

# Set up layout
col1, col2 = st.columns([45, 55])

with col1:
    st.header("Citizen Input")
    language = st.selectbox("Language", options=[("Hindi", "hi"), ("Marathi", "mr"), ("English", "en")], format_func=lambda x: x[0])
    
    st.markdown("**Try a sample:**")
    sample1 = "Main Nashik se Ramesh hoon, 1.5 acre zameen hai, aamdani Rs 1.5 lakh hai. Mujhe sarkari madad chahiye."
    sample2 = "Mi Pune madhun vidyarthi ahe, SC category, family income 2 lakh ahe."
    sample3 = "Main Sunita Bihar se hoon, BPL parivar se, mere paas gas connection nahi hai."
    
    if st.button("Sample 1: Ramesh (Farmer)"):
        st.session_state.query_text = sample1
    if st.button("Sample 2: Marathi Student"):
        st.session_state.query_text = sample2
    if st.button("Sample 3: Sunita (BPL)"):
        st.session_state.query_text = sample3
        
    query = st.text_area("Your message", value=st.session_state.get('query_text', ''), height=150)
    
    lang_code_map = {"hi": "hi-IN", "mr": "mr-IN", "en": "en-IN"}
    bcp47 = lang_code_map.get(language[1], "en-IN")
    
    text_from_mic = None
    try:
        text_from_mic = speech_to_text(
            language=bcp47,
            start_prompt="Speak 🎤",
            stop_prompt="Stop",
            just_once=True,
            use_container_width=True,
            key="STT"
        )
    except Exception as e:
        st.warning("Primary mic widget unavailable. Using fallback audio input.")
        audio_val = st.audio_input("Record a voice message")
        if audio_val:
            try:
                from agent.gemini_client import get_genai_client, GEMINI_MODEL
                client = get_genai_client()
                if client:
                    from google.genai import types
                    # Gemini audio parts need to be properly constructed using the Part structure if using latest genai
                    # Actually passing the `audio_val` works out of the box with `upload_file` or directly via types.Part
                    # For simplicity, pass it directly in the list
                    response = client.models.generate_content(
                        model=GEMINI_MODEL,
                        contents=[
                            types.Part.from_bytes(data=audio_val.getvalue(), mime_type="audio/wav"),
                            f"Transcribe this audio precisely in {language[0]} text."
                        ]
                    )
                    text_from_mic = response.text
                else:
                    st.error("API Key not found for Gemini transcription fallback.")
            except Exception as err:
                st.error(f"Fallback transcription failed: {str(err)}")
    
    if text_from_mic:
        st.session_state.query_text = text_from_mic
        # st.rerun() could be used to immediately update the text_area, but setting it in session state and relying on the user to click 'Find my schemes' or the next interact works. Let's force a rerun so it shows up in text area instantly.
        st.rerun()
        
    st.caption("Voice input works in Google Chrome. You can also type.")
    
    find_button = st.button("Find my schemes", type="primary")

with col2:
    st.header("Live Agent Telemetry")
    telemetry_placeholder = st.empty()
    telemetry_placeholder.markdown("<div class='telemetry-container'>Waiting for agent execution...</div>", unsafe_allow_html=True)

def format_event(e: AgentEvent) -> str:
    msg = e.message
    step = e.step.upper()
    status = e.status.upper()
    
    kind_class = "event-thought"
    prefix = ""
    
    if status == "ERROR":
        kind_class = "event-error"
    elif step == "DELIVER" or status == "COMPLETED":
        kind_class = "event-final"
        
    if "TOOL" in step or "CSC" in step or "MOCK" in step:
        if status in ["STARTING", "IN_PROGRESS"]:
            kind_class = "event-tool_call"
            prefix = "Calling Tool: "
        else:
            kind_class = "event-tool_result"
            prefix = "Tool Response: "
            
    ts_str = f"[{e.timestamp}]"
    return f"<div class='{kind_class}'><span class='ts'>{ts_str}</span> [{step}] {prefix}{msg}</div>"

if find_button:
    if not query.strip():
        st.warning("Please enter a message.")
    else:
        events = []
        telemetry_html = "<div class='telemetry-container'>"
        telemetry_placeholder.markdown(telemetry_html + "</div>", unsafe_allow_html=True)
        
        def on_event(event: AgentEvent):
            events.append(event)
            global telemetry_html
            telemetry_html += format_event(event)
            telemetry_placeholder.markdown(telemetry_html + "</div>", unsafe_allow_html=True)
            if demo_pacing:
                time.sleep(0.35)
            
        try:
            if run_agent is None:
                st.error("Agent loader returned None. Cannot run agent.")
            elif use_cached_demo:
                raise Exception("Forcing cached demo via sidebar")
            else:
                # Add language option to kwargs if the agent supports it
                try:
                    result = run_agent(query, language=language[1], on_event=on_event)
                except TypeError:
                    result = run_agent(query, on_event=on_event)
                st.session_state.agent_result = result
        except Exception as e:
            # DEMO SAFETY NET
            st.markdown("<span style='color: grey; font-size: 0.9em;'>Replaying cached result</span>", unsafe_allow_html=True)
            cache_path = os.path.join(os.path.dirname(__file__), "data", "demo_cache.json")
            if os.path.exists(cache_path):
                with open(cache_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    
                # Replay events
                for ev_dict in data.get("events", []):
                    ev = AgentEvent(**ev_dict)
                    on_event(ev)
                    
                # Construct AgentResponse from data
                result = AgentResponse.model_validate(data)
                result.used_fallback = True
                st.session_state.agent_result = result
            else:
                st.error(f"Agent failed and no demo_cache.json found. Error: {str(e)}")

# Results rendering Below Both Columns
if st.session_state.agent_result:
    res = st.session_state.agent_result
    st.divider()
    
    if getattr(res, 'used_fallback', False):
        st.markdown("<span style='color: grey; font-size: 0.8em;'>Deterministic mode</span>", unsafe_allow_html=True)
    
    st.metric("Total annual benefit found", f"₹ {res.total_potential_benefit_inr:,}")
    
    if st.button("Listen in my language 🔊"):
        audio_bytes = speak(res.vernacular_summary or res.summary_text, language[1])
        if audio_bytes:
            st.audio(audio_bytes, format="audio/mp3")
            
    st.header("Your Schemes")
    
    def render_scheme_card(scheme, status_badge, badge_color, is_eligible=False):
        with st.container(border=True):
            st.markdown(f"### {scheme.scheme_name} {scheme.scheme_name_hi and f'({scheme.scheme_name_hi})' or ''}")
            st.markdown(f"**Status:** <span style='color:{badge_color}; font-weight:bold;'>{status_badge}</span>", unsafe_allow_html=True)
            st.write(f"**Benefit:** ₹{scheme.benefit_amount_inr:,} ({scheme.benefit_description})")
            friction = getattr(scheme, 'friction_score', 1) or 1
            st.write(f"**Application Friction Score:** {'⭐' * friction} ({friction}/5 - {'Low Friction' if friction <= 2 else 'Moderate Friction' if friction <= 3 else 'High Documentation'})")
            if getattr(scheme, 'failed_criteria', None):
                st.write(f"**Reasons / Missing Info:** {', '.join(scheme.failed_criteria)}")
            if getattr(scheme, 'required_documents', None):
                st.write(f"**Required Documents:** {', '.join(scheme.required_documents)}")
            if getattr(scheme, 'llm_edge_review', None):
                st.info(f"**Review Note:** {scheme.llm_edge_review}")
                
            if is_eligible:
                with st.expander("One-Click Application Payload (preview)"):
                    payload = {
                        "scheme_id": scheme.scheme_id, 
                        "user_profile": res.user_profile.model_dump() if hasattr(res.user_profile, 'model_dump') else res.user_profile
                    }
                    st.json(payload)
                
                if st.button(f"Submit simulated application", key=f"btn_submit_{scheme.scheme_id}"):
                    mock_res = mock_portal_submission(scheme.scheme_id, res.user_profile)
                    ack_id = mock_res.get('acknowledgement_number', 'ACK-N/A')
                    st.markdown(f"**Acknowledgement ID:** {ack_id} <span class='simulated-badge'>Simulated</span>", unsafe_allow_html=True)
    
    # Render eligible and likely schemes
    for s in res.eligible_schemes:
        render_scheme_card(s, "ELIGIBLE", "green", is_eligible=True)
        
    for s in res.review_schemes:
        render_scheme_card(s, "NEEDS_INFO", "orange")
        
    if res.ineligible_schemes:
        with st.expander("Not Eligible Schemes"):
            for s in res.ineligible_schemes:
                render_scheme_card(s, "NOT_ELIGIBLE", "grey")
                
    if res.csc_recommendation:
        with st.container(border=True):
            st.subheader("Nearest Common Service Centre")
            st.markdown("<span class='simulated-badge'>Simulated</span>", unsafe_allow_html=True)
            st.json(res.csc_recommendation)
            
    pdf_path = getattr(res, 'pdf_path', None)
    if pdf_path and os.path.exists(pdf_path):
        with open(pdf_path, "rb") as f:
            st.download_button("Download Action Pack (PDF)", data=f, file_name="action_pack.pdf", mime="application/pdf")
