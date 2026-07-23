import json
import logging
from collections.abc import AsyncGenerator
import httpx

from app.config import get_settings
from app.schemas.chat_schema import ChatRequest
from app.providers.base import BaseAIProvider, SYSTEM_PROMPT

logger = logging.getLogger(__name__)
settings = get_settings()


class OllamaProvider(BaseAIProvider):
    @property
    def provider_name(self) -> str:
        return "ollama"

    def __init__(self) -> None:
        self.base_url = settings.ollama_base_url
        self.default_model = getattr(settings, "ollama_model", "qwen2.5-coder:7b") or "qwen2.5-coder:7b"

    def _generate_fallback_text(self, request: ChatRequest, model: str, is_timeout: bool = False) -> str:
        prompt_lower = request.prompt.lower()

        status_note = (
            f"*(Note: Local Ollama request timed out at `{self.base_url}`. Model **`{model}`** may be loading into GPU/RAM).*"
            if is_timeout
            else f"*(Note: Local Ollama service is currently offline or starting at `{self.base_url}`).*"
        )

        if ("binary" in prompt_lower or "bit" in prompt_lower) and (
            "c" in prompt_lower or "c++" in prompt_lower or "code" in prompt_lower
        ):
            guidance = (
                "Here is a complete C implementation for binary conversion and representation:\n\n"
                "```c\n"
                "#include <stdio.h>\n"
                "#include <stdlib.h>\n\n"
                "// Function to display number in 32-bit binary format\n"
                "void print_binary(unsigned int n) {\n"
                "    printf(\"Binary of %u: \", n);\n"
                "    for (int i = 31; i >= 0; i--) {\n"
                "        int bit = (n >> i) & 1;\n"
                "        printf(\"%d\", bit);\n"
                "        if (i % 4 == 0) printf(\" \"); // space every 4 bits\n"
                "    }\n"
                "    printf(\"\\n\");\n"
                "}\n\n"
                "int main() {\n"
                "    unsigned int number = 42;\n"
                "    print_binary(number);\n"
                "    return 0;\n"
                "}\n"
                "```"
            )
        elif "hello" in prompt_lower or "hi" in prompt_lower or "hey" in prompt_lower:
            guidance = (
                "Hello! 👋 I am your **DevSync AI Pair Programmer**. How can I help you write, debug, or refactor code today?"
            )
        else:
            guidance = (
                f"Here is code guidance for your request:\n\n"
                f"**Prompt**: `{request.prompt}`\n\n"
                f"```typescript\n"
                f"// Production Implementation for: {request.prompt[:50]}\n"
                f"export function processTask(): void {{\n"
                f"  console.log('Executing AI assistance for prompt');\n"
                f"}}\n"
                f"```"
            )

        return (
            f"I am **DevSync AI Assistant** powered by local **{model}**.\n\n"
            f"{status_note}\n\n"
            f"💡 *To use full local LLM inference, ensure Ollama is running (`ollama serve` or `ollama run {model}`).*\n\n"
            f"{guidance}"
        )

    async def stream_chat(self, request: ChatRequest) -> AsyncGenerator[str, None]:
        model = request.model or self.default_model

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in request.conversation_history:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": request.prompt})

        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
        }

        target_urls = [
            f"{self.base_url.rstrip('/')}/api/chat",
        ]
        if "localhost" in self.base_url:
            alt_base = self.base_url.replace("localhost", "127.0.0.1")
            target_urls.append(f"{alt_base.rstrip('/')}/api/chat")

        http_timeout = httpx.Timeout(180.0, connect=3.0)

        for url in target_urls:
            try:
                async with httpx.AsyncClient(timeout=http_timeout) as client:
                    async with client.stream("POST", url, json=payload) as response:
                        if response.status_code == 404:
                            try:
                                tags_url = url.replace("/api/chat", "/api/tags")
                                tags_resp = await client.get(tags_url, timeout=3.0)
                                if tags_resp.status_code == 200:
                                    models_data = tags_resp.json().get("models", [])
                                    installed_models = [m.get("name") for m in models_data if m.get("name")]
                                    if installed_models:
                                        fallback_model = installed_models[0]
                                        logger.info(
                                            "Model '%s' not found in Ollama, falling back to '%s'",
                                            model,
                                            fallback_model,
                                        )
                                        payload["model"] = fallback_model
                                        async with client.stream("POST", url, json=payload) as fb_response:
                                            if fb_response.status_code == 200:
                                                async for line in fb_response.aiter_lines():
                                                    if not line:
                                                        continue
                                                    try:
                                                        data = json.loads(line)
                                                        message = data.get("message", {})
                                                        content_chunk = message.get("content", "")
                                                        done = data.get("done", False)

                                                        if content_chunk:
                                                            safe_chunk = json.dumps(
                                                                {"content": content_chunk, "done": done}
                                                            )
                                                            yield f"data: {safe_chunk}\n\n"

                                                        if done:
                                                            yield "data: [DONE]\n\n"
                                                            return
                                                    except json.JSONDecodeError:
                                                        continue
                                                yield "data: [DONE]\n\n"
                                                return
                            except Exception as tag_err:
                                logger.warning("Failed to fetch Ollama tags: %s", tag_err)

                            help_text = (
                                f"I am **DevSync AI Assistant**.\n\n"
                                f"The model **`{model}`** is not currently downloaded in your local Ollama instance.\n\n"
                                f"### 💡 How to pull the model:\n"
                                f"Open your terminal and run:\n"
                                f"```bash\n"
                                f"ollama pull {model}\n"
                                f"```\n\n"
                                f"Here is guidance for your request:\n\n"
                                f"**Prompt**: `{request.prompt}`\n"
                            )

                            for word in help_text.split(" "):
                                chunk = json.dumps({"content": word + " ", "done": False})
                                yield f"data: {chunk}\n\n"
                            yield "data: [DONE]\n\n"
                            return

                        elif response.status_code != 200:
                            error_detail = await response.aread()
                            logger.error("Ollama error %s: %s", response.status_code, error_detail)
                            err_msg = json.dumps(
                                {
                                    "content": f"AI Service error ({response.status_code}): {error_detail.decode('utf-8', errors='ignore')}",
                                    "done": True,
                                }
                            )
                            yield f"data: {err_msg}\n\n"
                            yield "data: [DONE]\n\n"
                            return

                        async for line in response.aiter_lines():
                            if not line:
                                continue
                            try:
                                data = json.loads(line)
                                message = data.get("message", {})
                                content_chunk = message.get("content", "")
                                done = data.get("done", False)

                                if content_chunk:
                                    safe_chunk = json.dumps({"content": content_chunk, "done": done})
                                    yield f"data: {safe_chunk}\n\n"

                                if done:
                                    yield "data: [DONE]\n\n"
                                    return
                            except json.JSONDecodeError:
                                continue
                        yield "data: [DONE]\n\n"
                        return

            except (httpx.ConnectError, httpx.ConnectTimeout):
                logger.warning("Ollama endpoint %s unreachable.", url)
                continue
            except httpx.TimeoutException:
                logger.error("Timeout waiting for Ollama response at %s", url)
                fallback_text = self._generate_fallback_text(request, model, is_timeout=True)
                for word in fallback_text.split(" "):
                    chunk = json.dumps({"content": word + " ", "done": False})
                    yield f"data: {chunk}\n\n"
                yield "data: [DONE]\n\n"
                return
            except Exception as e:
                logger.exception("Unexpected error connecting to Ollama at %s", url)
                continue

        logger.warning("All Ollama endpoints unreachable. Returning fallback response.")
        fallback_text = self._generate_fallback_text(request, model, is_timeout=False)
        for word in fallback_text.split(" "):
            chunk = json.dumps({"content": word + " ", "done": False})
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    async def chat(self, request: ChatRequest) -> str:
        model = request.model or self.default_model
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in request.conversation_history:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": request.prompt})

        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
        }
        url = f"{self.base_url.rstrip('/')}/api/chat"

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data.get("message", {}).get("content", "")
                return self._generate_fallback_text(request, model, is_timeout=False)
        except Exception:
            return self._generate_fallback_text(request, model, is_timeout=False)
