import streamlit as st
import os

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

# Header and tagline
st.title("SchemeSetu Bharat")
st.subheader("Apni yojana, apna haq")

# Thin tricolour bar
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
</style>
<div class="tricolour-bar"></div>
""", unsafe_allow_html=True)

# Placeholder for future UI
st.info("UI elements will be added here.")

if __name__ == "__main__":
    pass
