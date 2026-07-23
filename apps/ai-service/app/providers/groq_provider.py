import json
import logging
from collections.abc import AsyncGenerator
import httpx

from app.config import get_settings
from app.schemas.chat_schema import ChatRequest
from app.providers.base import BaseAIProvider, SYSTEM_PROMPT

logger = logging.getLogger(__name__)
settings = get_settings()


class GroqProvider(BaseAIProvider):
    @property
    def provider_name(self) -> str:
        return "groq"

    def __init__(self) -> None:
        self.api_key = settings.groq_api_key
        self.default_model = settings.groq_model or "llama-3.3-70b-versatile"
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

    def _build_messages(self, request: ChatRequest) -> list[dict]:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in request.conversation_history:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": request.prompt})
        return messages

    def _format_error(self, error_code: str, message: str) -> str:
        return json.dumps({
            "success": False,
            "provider": self.provider_name,
            "error": error_code,
            "message": message,
        })

    def _map_http_error(self, status_code: int, detail: str) -> tuple[str, str]:
        detail_lower = detail.lower()
        if status_code == 401 or "invalid_api_key" in detail_lower or "unauthorized" in detail_lower:
            return (
                "INVALID_API_KEY",
                "Invalid or missing Groq API Key. Please verify your GROQ_API_KEY in environment settings.",
            )
        elif status_code == 429:
            if "quota" in detail_lower or "exceeded" in detail_lower:
                return (
                    "QUOTA_EXCEEDED",
                    "Groq API quota exceeded. Please upgrade your Groq tier or try again later.",
                )
            return (
                "RATE_LIMIT",
                "AI service has temporarily reached its free usage limit. Please try again later.",
            )
        elif status_code == 404 or "model_not_found" in detail_lower:
            return (
                "MODEL_NOT_FOUND",
                f"The requested Groq model is not available or invalid: {detail}",
            )
        else:
            return (
                "SERVICE_ERROR",
                f"Groq API returned an error ({status_code}): {detail}",
            )

    async def stream_chat(self, request: ChatRequest) -> AsyncGenerator[str, None]:
        if not self.api_key or self.api_key == "your_groq_api_key_here":
            err_msg = "Groq API Key is missing. Please set GROQ_API_KEY in your environment configuration."
            logger.error("GroqProvider error: INVALID_API_KEY")
            yield f"data: {json.dumps({'content': f'⚠️ **AI Service Error (INVALID_API_KEY)**: {err_msg}', 'done': True})}\n\n"
            yield "data: [DONE]\n\n"
            return

        model = (
            request.model
            if (request.model and "qwen" not in request.model and "coder" not in request.model)
            else self.default_model
        )
        messages = self._build_messages(request)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
            "temperature": 0.2,
            "max_tokens": 4096,
        }

        http_timeout = httpx.Timeout(60.0, connect=5.0)

        try:
            async with httpx.AsyncClient(timeout=http_timeout) as client:
                async with client.stream("POST", self.base_url, headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        error_body = await response.aread()
                        detail = error_body.decode("utf-8", errors="ignore")
                        err_code, err_msg = self._map_http_error(response.status_code, detail)
                        logger.error("Groq API [%s]: %s", err_code, err_msg)

                        yield f"data: {json.dumps({'content': f'⚠️ **AI Service Error ({err_code})**: {err_msg}', 'done': True})}\n\n"
                        yield "data: [DONE]\n\n"
                        return

                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        line_str = line.strip()
                        if not line_str.startswith("data:"):
                            continue

                        data_str = line_str[5:].strip()
                        if data_str == "[DONE]":
                            yield "data: [DONE]\n\n"
                            return

                        try:
                            data = json.loads(data_str)
                            choices = data.get("choices", [])
                            if choices:
                                delta = choices[0].get("delta", {})
                                content_chunk = delta.get("content", "")
                                if content_chunk:
                                    safe_chunk = json.dumps({"content": content_chunk, "done": False})
                                    yield f"data: {safe_chunk}\n\n"
                        except json.JSONDecodeError:
                            continue

            yield "data: [DONE]\n\n"

        except httpx.ConnectTimeout:
            err_code, err_msg = (
                "TIMEOUT",
                "Connection to Groq API timed out. Please check your network connection.",
            )
            logger.error("Groq API [%s]: %s", err_code, err_msg)
            yield f"data: {json.dumps({'content': f'⚠️ **AI Service Error ({err_code})**: {err_msg}', 'done': True})}\n\n"
            yield "data: [DONE]\n\n"
        except (httpx.ConnectError, httpx.NetworkError) as net_err:
            err_code, err_msg = "NETWORK_FAILURE", f"Network failure connecting to Groq API: {str(net_err)}"
            logger.error("Groq API [%s]: %s", err_code, err_msg)
            yield f"data: {json.dumps({'content': f'⚠️ **AI Service Error ({err_code})**: {err_msg}', 'done': True})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.exception("Unexpected error in GroqProvider.stream_chat")
            yield f"data: {json.dumps({'content': f'⚠️ **AI Service Error**: {str(e)}', 'done': True})}\n\n"
            yield "data: [DONE]\n\n"

    async def chat(self, request: ChatRequest) -> str:
        if not self.api_key or self.api_key == "your_groq_api_key_here":
            return self._format_error("INVALID_API_KEY", "Groq API key missing")

        model = (
            request.model
            if (request.model and "qwen" not in request.model and "coder" not in request.model)
            else self.default_model
        )
        messages = self._build_messages(request)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "temperature": 0.2,
            "max_tokens": 4096,
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(self.base_url, headers=headers, json=payload)
                if response.status_code != 200:
                    err_code, err_msg = self._map_http_error(response.status_code, response.text)
                    return self._format_error(err_code, err_msg)

                res_data = response.json()
                choices = res_data.get("choices", [])
                if choices:
                    return choices[0].get("message", {}).get("content", "")
                return ""
        except Exception as e:
            return self._format_error("NETWORK_FAILURE", str(e))
