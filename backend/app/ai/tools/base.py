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
        """Convert to Gemini SDK FunctionDeclaration"""
        schema_dict = self.parameters_schema

        properties = {}
        for prop_name, prop_def in schema_dict.get("properties", {}).items():
            prop_type = prop_def.get("type", "string")
            type_mapping = {
                "string": types.Type.STRING,
                "integer": types.Type.INTEGER,
                "number": types.Type.NUMBER,
                "boolean": types.Type.BOOLEAN,
                "array": types.Type.ARRAY,
                "object": types.Type.OBJECT
            }

            gemini_type = type_mapping.get(prop_type, types.Type.STRING)
            properties[prop_name] = types.Schema(
                type=gemini_type,
                description=prop_def.get("description", "")
            )

        parameters = types.Schema(
            type=types.Type.OBJECT,
            properties=properties,
            required=schema_dict.get("required", [])
        )

        return types.FunctionDeclaration(
            name=self.name,
            description=self.description,
            parameters=parameters
        )
