from typing import TypedDict


class AgentState(TypedDict):
    prompt: str
    workspace_id: str
    context: str
    builder_output: str
    critic_review: str
    final_response: str
