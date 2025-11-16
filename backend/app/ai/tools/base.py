from abc import ABC, abstractmethod
from typing import Any, Dict
from dataclasses import dataclass
from google.genai import types


@dataclass
class ToolResult:
    success: bool
    data: Any = None
    error: str = None


class BaseTool(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        pass

    @property
    def parameters_schema(self) -> Dict[str, Any]:
        """
        Return OpenAPI-style parameter schema
        Example:
        {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "..."}
            },
            "required": ["query"]
        }
        """
        return {
            "type": "object",
            "properties": {},
            "required": []
        }

    @abstractmethod
    def execute(self, **kwargs) -> ToolResult:
        pass

    def to_gemini_declaration(self) -> types.FunctionDeclaration:
        import re

        raw_name = self.name
        if not raw_name or not isinstance(raw_name, str):
            raise ValueError(f"Tool name must be a non-empty string, got: {repr(raw_name)}")

        name = raw_name.strip()
        
        if not name:
            raise ValueError(f"Tool name is empty after stripping: {repr(raw_name)}")
        
        if len(name) > 64:
            raise ValueError(f"Tool name too long ({len(name)} chars): {name}")
        
        first_char = name[0]
        if not first_char.isalpha() and first_char != '_':
            raise ValueError(f"Tool name must start with letter or underscore, got: {repr(first_char)} in {repr(name)}")
        
        if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_.:\-]*$', name):
            invalid_chars = [c for c in name if not re.match(r'[a-zA-Z0-9_.:\-]', c)]
            raise ValueError(f"Invalid characters in tool name '{name}': {invalid_chars} (bytes: {[hex(ord(c)) for c in invalid_chars]})")

        schema_dict = self.parameters_schema

        properties = {}
        for prop_name, prop_def in schema_dict.get("properties", {}).items():
            prop_type = prop_def.get("type", "string")
            
            schema_kwargs = {
                "type": prop_type,
                "description": prop_def.get("description", "")
            }
            
            if "enum" in prop_def:
                schema_kwargs["enum"] = prop_def["enum"]
            if "default" in prop_def:
                schema_kwargs["default"] = prop_def["default"]
            if "minimum" in prop_def:
                schema_kwargs["minimum"] = prop_def["minimum"]
            if "maximum" in prop_def:
                schema_kwargs["maximum"] = prop_def["maximum"]
            
            properties[prop_name] = types.Schema(**schema_kwargs)

        parameters = types.Schema(
            type="object",
            properties=properties,
            required=schema_dict.get("required", [])
        )

        return types.FunctionDeclaration(
            name=name,
            description=self.description,
            parameters=parameters
        )
