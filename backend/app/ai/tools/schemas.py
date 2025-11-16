from pydantic import BaseModel, Field
from typing import List, Optional


class BookDetails(BaseModel):
    """Chi tiết một cuốn sách"""
    id: Optional[int] = Field(description="ID sách")
    title: str = Field(description="Tiêu đề sách")
    author: Optional[str] = Field(description="Tác giả sách", default=None)
    accuracy: Optional[float] = Field(description="Độ chính xác của kết quả tìm kiếm", default=None)
    source: Optional[str] = Field(description="Nguồn dữ liệu sách", default="Mock DB")


class SearchBooksResponse(BaseModel):
    """Response khi tìm kiếm sách"""
    text: str = Field(description="Đoạn tin nhắn sẽ trả lời lại user")
    books: Optional[List[BookDetails]] = Field(description="Danh sách sách liên quan đến truy vấn")
