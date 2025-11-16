"""
Gemini Structured Output Schemas
Định nghĩa các schema JSON cho Gemini API responses
"""
from google.genai import types


def get_chat_response_schema():
    """
    Schema cho chat response với book suggestions
    
    Response format:
    {
        "text": "Câu trả lời cho user...",
        "books": [
            {
                "id": "2194",
                "title": "Python Crash Course",
                "author": "Eric Matthes",
                "accuracy": "95%",
                "source": "Z39.50 - LOC",
                "related": [
                    {"type": "chủ đề", "value": "Lập trình Python"},
                    {"type": "sách cùng tác giả", "value": "..."}
                ]
            }
        ]
    }
    """
    return types.Schema(
        type=types.Type.OBJECT,
        properties={
            "text": types.Schema(
                type=types.Type.STRING,
                description="Câu trả lời tự nhiên cho user"
            ),
            "books": types.Schema(
                type=types.Type.ARRAY,
                description="Danh sách sách gợi ý (có thể empty array [] nếu không tìm thấy)",
                items=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "id": types.Schema(
                            type=types.Type.STRING,
                            description="ID của sách"
                        ),
                        "title": types.Schema(
                            type=types.Type.STRING,
                            description="Tên sách"
                        ),
                        "author": types.Schema(
                            type=types.Type.STRING,
                            description="Tác giả"
                        ),
                        "accuracy": types.Schema(
                            type=types.Type.STRING,
                            description="Độ phù hợp (95%, 85%, 70%...)"
                        ),
                        "source": types.Schema(
                            type=types.Type.STRING,
                            description="Nguồn (Local DB, Z39.50 - LOC, Z39.50 - UW)"
                        ),
                        "related": types.Schema(
                            type=types.Type.ARRAY,
                            description="Thông tin liên quan (tags)",
                            items=types.Schema(
                                type=types.Type.OBJECT,
                                properties={
                                    "type": types.Schema(
                                        type=types.Type.STRING,
                                        description="Loại (chủ đề, sách cùng tác giả, thể loại)"
                                    ),
                                    "value": types.Schema(
                                        type=types.Type.STRING,
                                        description="Giá trị"
                                    )
                                },
                                required=["type", "value"]
                            )
                        )
                    },
                    required=["id", "title", "author", "accuracy", "source", "related"]
                )
            )
        },
        required=["text"]
    )


