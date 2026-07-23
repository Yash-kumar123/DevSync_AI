import logging
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)


class AIServiceException(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(status_code=status_code, detail=detail)


def format_error_chunk(error_message: str) -> str:
    """Format an error message as an SSE data payload."""
    return f"data: [ERROR] {error_message}\n\n"
