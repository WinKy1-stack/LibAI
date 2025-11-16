from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Union

from google import genai
from google.genai import types

from app.ai.exceptions import GeminiAPIError, InvalidConfigurationError


SafetyConfig = Iterable[types.SafetySetting]
ContentInput = Union[str, Dict[str, Any], List[Dict[str, Any]]]


DEFAULT_SAFETY_SETTINGS: List[types.SafetySetting] = [
    types.SafetySetting(
        category="HARM_CATEGORY_HARASSMENT",
        threshold="BLOCK_MEDIUM_AND_ABOVE",
    ),
    types.SafetySetting(
        category="HARM_CATEGORY_HATE_SPEECH",
        threshold="BLOCK_MEDIUM_AND_ABOVE",
    ),
    types.SafetySetting(
        category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold="BLOCK_MEDIUM_AND_ABOVE",
    ),
    types.SafetySetting(
        category="HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold="BLOCK_MEDIUM_AND_ABOVE",
    ),
]


@dataclass(frozen=True)
class GeminiClientSettings:
    model: str
    temperature: float = 0.7
    max_output_tokens: int = 1000
    top_p: float = 0.95
    top_k: int = 40

    def build_generation_config(
        self,
        *,
        system_instruction: str,
        safety_settings: Optional[SafetyConfig] = None,
        tools: Optional[List[types.FunctionDeclaration]] = None,
        **overrides: Any,
    ) -> types.GenerateContentConfig:
        config_kwargs = {
            "temperature": overrides.get("temperature", self.temperature),
            "max_output_tokens": overrides.get("max_output_tokens", self.max_output_tokens),
            "top_p": overrides.get("top_p", self.top_p),
            "top_k": overrides.get("top_k", self.top_k),
            "system_instruction": system_instruction,
            "safety_settings": list(safety_settings or DEFAULT_SAFETY_SETTINGS),
        }
        
        if tools and len(tools) > 0:
            config_kwargs["tools"] = [types.Tool(function_declarations=tools)]
        
        return types.GenerateContentConfig(**config_kwargs)


class GoogleGenAIClient:
    def __init__(self, *, api_key: str, settings: GeminiClientSettings):
        if not api_key:
            raise InvalidConfigurationError("Thiếu GEMINI_API_KEY trong cấu hình")
        if not settings.model:
            raise InvalidConfigurationError("Thiếu GEMINI_MODEL trong cấu hình")

        try:
            self._client = genai.Client(api_key=api_key)
        except Exception as exc:
            raise InvalidConfigurationError(f"Không thể khởi tạo google-genai client: {exc}") from exc

        self.settings = settings

    @property
    def model(self) -> str:
        return self.settings.model

    def generate_content(
        self,
        *,
        contents: ContentInput,
        system_instruction: str,
        safety_settings: Optional[SafetyConfig] = None,
        **overrides: Any,
    ) -> Any:
        config = self.settings.build_generation_config(
            system_instruction=system_instruction,
            safety_settings=safety_settings,
            **overrides,
        )
        try:
            return self._client.models.generate_content(
                model=self.model,
                contents=contents,
                config=config,
            )
        except Exception as exc:
            raise GeminiAPIError(f"Lỗi gọi Gemini API: {exc}") from exc

    def create_chat_session(
        self,
        *,
        system_instruction: str,
        safety_settings: Optional[SafetyConfig] = None,
        tools: Optional[List[types.FunctionDeclaration]] = None,
        **overrides: Any,
    ):
        config = self.settings.build_generation_config(
            system_instruction=system_instruction,
            safety_settings=safety_settings,
            tools=tools,
            **overrides,
        )
        try:
            return self._client.chats.create(
                model=self.model,
                config=config,
            )
        except Exception as exc:
            raise InvalidConfigurationError(f"Không thể khởi tạo chat session: {exc}") from exc


__all__ = [
    "DEFAULT_SAFETY_SETTINGS",
    "GeminiClientSettings",
    "GoogleGenAIClient",
]
