import logging
import time
from typing import List, Dict, Optional, Any

from app.ai.exceptions import GeminiAPIError
from app.ai.clients import GoogleGenAIClient
from app.ai.agents import ChatAgent
from app.ai.tools import get_tool_registry

logger = logging.getLogger(__name__)


def retry_on_503(max_retries=3, base_delay=1.0):
    """Retry decorator cho 503 errors với exponential backoff"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except GeminiAPIError as e:
                    error_msg = str(e)
                    is_503 = ("503" in error_msg or "UNAVAILABLE" in error_msg or 
                             "overloaded" in error_msg.lower())
                    
                    if not is_503 or attempt == max_retries - 1:
                        raise
                    
                    delay = base_delay * (2 ** attempt)
                    logger.warning(
                        f"API 503 (lần {attempt + 1}/{max_retries}), retry sau {delay}s"
                    )
                    time.sleep(delay)
                    last_exception = e
                except Exception:
                    raise
            
            if last_exception:
                raise last_exception
        return wrapper
    return decorator


class ChatSession:
    def __init__(
        self,
        client: GoogleGenAIClient,
        model_id: str,
        config: Dict[str, Any],
        system_instruction: str,
        initial_history: Optional[List[Dict[str, str]]] = None
    ):
        self.client = client
        self.model_id = model_id
        self.config = config
        self.system_instruction = system_instruction
        
        self.tool_registry = get_tool_registry()
        
        self.chat = self._create_chat()
        
        self.agent = ChatAgent(
            chat_session=self,
            tool_registry=self.tool_registry
        )

        logger.info(
            "Created chat session (model=%s, history_size=%d, tools=%d)",
            model_id,
            len(initial_history) if initial_history else 0,
            len(self.tool_registry.get_all())
        )

    def _generation_overrides(self) -> Dict[str, Any]:
        return {
            'temperature': self.config.get('GEMINI_TEMPERATURE', 0.7),
            'max_output_tokens': self.config.get('GEMINI_MAX_TOKENS', 1000),
            'top_p': self.config.get('GEMINI_TOP_P', 0.95),
            'top_k': self.config.get('GEMINI_TOP_K', 40)
        }

    def _create_chat(self):
        """Create Gemini chat session with tools"""
        tools = None
        if self.tool_registry:
            tools = self.tool_registry.get_function_declarations()
            if tools:
                num_tools = len(self.tool_registry.get_all())
                logger.info(f"Registering {num_tools} tools with Gemini SDK")

        return self.client.create_chat_session(
            system_instruction=self.system_instruction,
            tools=tools,
            **self._generation_overrides()
        )

    @retry_on_503(max_retries=3, base_delay=1.0)
    def send_message(self, message: str) -> str:
        try:
            response = self.chat.send_message(message)
            
            # Kiểm tra xem có function call không
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, 'content') and candidate.content:
                    for part in candidate.content.parts:
                        if hasattr(part, 'function_call') and part.function_call:
                            # Có function call, thực thi tool
                            logger.info(f"Detected function call: {part.function_call.name}")
                            result = self._handle_function_call(part.function_call)
                            
                            # Gửi kết quả tool execution trở lại Gemini
                            from google.genai import types
                            function_response = types.Part(
                                function_response=types.FunctionResponse(
                                    name=part.function_call.name,
                                    response=result
                                )
                            )
                            
                            # Gửi lại để lấy response cuối cùng
                            final_response = self.chat.send_message(function_response)
                            return final_response.text.strip()
            
            return response.text.strip()
        except GeminiAPIError:
            raise
        except Exception as e:
            logger.error("Chat session error: %s", str(e))
            raise GeminiAPIError(f"Lỗi khi chat với AI: {str(e)}") from e
    
    def _handle_function_call(self, function_call) -> Dict[str, Any]:
        """
        Execute function call from Gemini and return result

        Args:
            function_call: FunctionCall object from Gemini response

        Returns:
            Dict result to send back to Gemini
        """
        tool_name = function_call.name
        tool_args = dict(function_call.args) if hasattr(function_call, 'args') else {}

        logger.info(f"🔧 [FUNCTION CALL] {tool_name}({tool_args})")

        tool = self.tool_registry.get(tool_name)
        if not tool:
            logger.error(f"Tool not found: {tool_name}")
            return {"error": f"Tool '{tool_name}' không tồn tại"}

        try:
            result = tool.execute(**tool_args)
            if result.success:
                logger.info(f"✓ Tool {tool_name} executed successfully")
                return result.data if isinstance(result.data, dict) else {"result": result.data}
            else:
                logger.error(f"✗ Tool {tool_name} failed: {result.error}")
                return {"error": result.error}
        except Exception as e:
            logger.error(f"✗ Error executing tool {tool_name}: {str(e)}")
            return {"error": str(e)}

    def send_message_stream(self, message: str):
        try:
            response = self.chat.send_message_stream(message)
            for chunk in response:
                if hasattr(chunk, 'text') and chunk.text:
                    yield chunk.text
        except GeminiAPIError:
            raise
        except Exception as e:
            logger.error("Chat stream error: %s", str(e))
            raise GeminiAPIError(f"Lỗi khi stream chat: {str(e)}") from e

    def run(self, message: str) -> str:
        return self.agent.run(message)

    def run_stream(self, message: str):
        return self.agent.run_stream(message)

    def get_history(self) -> List[Dict[str, Any]]:
        try:
            history = []
            for msg in self.chat.get_history():
                history.append({
                    'role': msg.role,
                    'content': msg.parts[0].text if msg.parts else ''
                })
            return history
        except Exception as e:
            logger.error("Get history error: %s", str(e))
            return []

    def clear_history(self):
        self.chat = self._create_chat()
        logger.info("Chat session history cleared")
