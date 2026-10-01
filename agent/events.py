"""Agent telemetry events model and callback utilities.

Every agent step must emit an AgentEvent so the UI can show live telemetry.
Simulated features must carry a flag simulated=True.
"""

from typing import Callable
from agent.models import AgentEvent

# Type alias for event listener callbacks
AgentEventCallback = Callable[[AgentEvent], None]

__all__ = ["AgentEvent", "AgentEventCallback"]
