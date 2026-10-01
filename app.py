import streamlit as st
import os
import json
from agent.models import AgentResponse, AgentEvent

st.set_page_config(layout="wide", page_title="SchemeSetu Bharat", page_icon="🇮🇳")

def get_run_agent():
    """
    Imports run_agent from agent.agent normally, but from agent.stub 
    when env USE_STUB=1 or when the real module is missing.
    """
    use_stub = os.environ.get("USE_STUB", "0") == "1"
    
    if use_stub:
        try:
            from agent.stub import run_agent
            return run_agent
        except ImportError:
            return None
    else:
        try:
            from agent.agent import run_agent
            return run_agent
        except ImportError:
            try:
                from agent.stub import run_agent
                return run_agent
            except ImportError:
                return None

run_agent = get_run_agent()

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
    
    st.markdown("<div style='height: 50px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #888; margin-bottom: 10px;'>[Microphone Widget Placeholder]</div>", unsafe_allow_html=True)
    
    find_button = st.button("Find my schemes", type="primary")

with col2:
    st.header("Live Agent Telemetry")
    telemetry_placeholder = st.empty()
    # initialize empty box
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
            
        try:
            if run_agent is None:
                st.error("Agent loader returned None. Cannot run agent.")
            else:
                # Add language option to kwargs if the agent supports it
                result = run_agent(query, on_event=on_event)
                st.session_state.agent_result = result
        except Exception as e:
            st.error(f"An error occurred while running the agent: {str(e)}")

# Results rendering Below Both Columns
if st.session_state.agent_result:
    res: AgentResponse = st.session_state.agent_result
    st.divider()
    
    st.metric("Total annual benefit found", f"₹ {res.total_potential_benefit_inr:,}")
    
    st.header("Your Schemes")
    
    def render_scheme_card(scheme, status_badge, badge_color):
        with st.container(border=True):
            st.markdown(f"### {scheme.scheme_name} {scheme.scheme_name_hi and f'({scheme.scheme_name_hi})' or ''}")
            st.markdown(f"**Status:** <span style='color:{badge_color}; font-weight:bold;'>{status_badge}</span>", unsafe_allow_html=True)
            st.write(f"**Benefit:** ₹{scheme.benefit_amount_inr} ({scheme.benefit_description})")
            if scheme.failed_criteria:
                st.write(f"**Reasons / Missing Info:** {', '.join(scheme.failed_criteria)}")
            if scheme.required_documents:
                st.write(f"**Required Documents:** {', '.join(scheme.required_documents)}")
            if getattr(scheme, 'llm_edge_review', None):
                st.info(f"**Review Note:** {scheme.llm_edge_review}")
    
    # Render eligible and likely schemes
    for s in res.eligible_schemes:
        render_scheme_card(s, "ELIGIBLE", "green")
        
    for s in res.review_schemes:
        render_scheme_card(s, "NEEDS_INFO", "orange")
        
    if res.ineligible_schemes:
        with st.expander("Not Eligible Schemes"):
            for s in res.ineligible_schemes:
                render_scheme_card(s, "NOT_ELIGIBLE", "grey")
                
    if res.csc_recommendation:
        with st.container(border=True):
            st.subheader("Nearest Common Service Centre")
            st.caption("🏷️ Simulated")
            st.json(res.csc_recommendation)
            
    with st.expander("One-Click Application Payload (preview)"):
        payloads = []
        for s in res.eligible_schemes:
            payloads.append({
                "scheme_id": s.scheme_id, 
                "user_profile": res.user_profile.model_dump() if hasattr(res.user_profile, 'model_dump') else res.user_profile
            })
        st.json(payloads)
        
    pdf_path = getattr(res, 'pdf_path', None)
    if pdf_path and os.path.exists(pdf_path):
        with open(pdf_path, "rb") as f:
            st.download_button("Download my Action Pack (PDF)", data=f, file_name="action_pack.pdf", mime="application/pdf")
