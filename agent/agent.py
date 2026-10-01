"""Agent entrypoint module for SchemeSetu Bharat.

Provides unified run_agent interface used by app.py.
"""

import os
from typing import Optional
from agent.events import AgentEventCallback
from agent.models import AgentResponse
from agent.stub import run_stub_agent

def run_agent(
    user_text: str,
    language: str = "hi",
    on_event: Optional[AgentEventCallback] = None,
) -> AgentResponse:
    """Execute SchemeSetu Bharat agent with seamless fallback to stub."""
    use_stub = os.environ.get("USE_STUB", "0") == "1"
    if not use_stub:
        try:
            from agent.orchestrator import SchemeSetuAgent
            agent = SchemeSetuAgent()
            return agent.run(user_text, on_event=on_event)
        except Exception:
            pass

    # Seamless fallback to stub for SYNC 1 live demo reliability
    return run_stub_agent(user_text, language=language, on_event=on_event)
