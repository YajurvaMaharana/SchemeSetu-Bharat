"""Agent telemetry events model and callback utilities.

Every agent step must emit an AgentEvent so the UI can show live telemetry.
Simulated features must carry a flag simulated=True.
"""

from datetime import datetime, timezone
from typing import Any, Callable, Dict, Optional
from pydantic import BaseModel, Field


class AgentEvent(BaseModel):
    """Structured telemetry event emitted during each step of the agent execution lifecycle."""

    step: str = Field(
        ...,
        description="Current agent lifecycle phase (e.g., PROFILE_EXTRACTION, DETERMINISTIC_RULES, EDGE_CASE_REVIEW, CSC_LOCATOR, MOCK_SUBMISSION, DELIVER)",
    )
    status: str = Field(
        ...,
        description="Event status: STARTING, IN_PROGRESS, COMPLETED, WARNING, ERROR",
    )
    message: str = Field(
        ...,
        description="Human-readable status message for user feedback and UI telemetry log",
    )
    data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Structured payload containing intermediate step output, profile, or results",
    )
    simulated: bool = Field(
        default=False,
        description="Flag indicating whether this step or action was simulated (e.g., CSC lookup, portal submit)",
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="UTC ISO-8601 timestamp of the event",
    )


# Type alias for event listener callbacks
AgentEventCallback = Callable[[AgentEvent], None]
