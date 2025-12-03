from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class BookTitle(BaseModel):
    """Book title information"""
    main: str = Field(description="Main title")
    subtitle: Optional[str] = Field(None, description="Subtitle")
    uniform: Optional[str] = Field(None, description="Uniform title")


class BookContributor(BaseModel):
    """Book contributor (author, editor, etc.)"""
    name: str = Field(description="Contributor name")
    role: Optional[str] = Field(None, description="Role (author, editor, translator, etc.)")


class BookPublication(BaseModel):
    """Book publication information"""
    publisher: Optional[str] = Field(None, description="Publisher name")
    place: Optional[str] = Field(None, description="Place of publication")
    year: Optional[str] = Field(None, description="Year of publication")
    date: Optional[str] = Field(None, description="Full publication date")


class BookPhysicalDescription(BaseModel):
    """Physical description of the book"""
    pages: Optional[str] = Field(None, description="Number of pages")
    dimensions: Optional[str] = Field(None, description="Physical dimensions")
    material: Optional[str] = Field(None, description="Material type")


class BookItem(BaseModel):
    """Individual item (copy) of a book"""
    item_id: int = Field(description="Item ID")
    barcode: Optional[str] = Field(None, description="Item barcode")
    call_number: Optional[str] = Field(None, description="Call number")
    location: Optional[str] = Field(None, description="Item location")
    home_library: Optional[str] = Field(None, description="Home library code")
    current_library: Optional[str] = Field(None, description="Current library code")
    status: Optional[str] = Field(None, description="Item status")
    available: bool = Field(False, description="Is item available for checkout")
    due_date: Optional[datetime] = Field(None, description="Due date if checked out")


class Book(BaseModel):
    """Complete book/bibliographic record"""
    biblio_id: int = Field(description="Bibliographic record ID")
    title: str = Field(description="Main title")
    subtitle: Optional[str] = Field(None, description="Subtitle")
    author: Optional[str] = Field(None, description="Main author")
    contributors: List[BookContributor] = Field(default_factory=list, description="All contributors")
    isbn: Optional[str] = Field(None, description="ISBN")
    issn: Optional[str] = Field(None, description="ISSN")
    publication: Optional[BookPublication] = Field(None, description="Publication info")
    subjects: List[str] = Field(default_factory=list, description="Subject headings")
    summary: Optional[str] = Field(None, description="Abstract/summary")
    language: Optional[str] = Field(None, description="Language code")
    physical_description: Optional[BookPhysicalDescription] = Field(None, description="Physical details")
    series: Optional[str] = Field(None, description="Series information")
    notes: List[str] = Field(default_factory=list, description="Notes")
    items: List[BookItem] = Field(default_factory=list, description="Physical items")
    
    class Config:
        json_schema_extra = {
            "example": {
                "biblio_id": 123,
                "title": "Lập trình Python",
                "author": "Nguyễn Văn A",
                "isbn": "978-604-123-456-7",
                "publication": {
                    "publisher": "NXB Giáo dục",
                    "year": "2024"
                }
            }
        }


class PatronAddress(BaseModel):
    """Patron address information"""
    address: Optional[str] = Field(None, description="Street address")
    city: Optional[str] = Field(None, description="City")
    state: Optional[str] = Field(None, description="State/Province")
    postal_code: Optional[str] = Field(None, description="Postal code")
    country: Optional[str] = Field(None, description="Country")


class PatronContact(BaseModel):
    """Patron contact information"""
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    mobile: Optional[str] = Field(None, description="Mobile number")


class Patron(BaseModel):
    """Library patron (user)"""
    patron_id: int = Field(description="Patron ID")
    cardnumber: Optional[str] = Field(None, description="Library card number")
    surname: str = Field(description="Surname/Family name")
    firstname: Optional[str] = Field(None, description="First name")
    title: Optional[str] = Field(None, description="Title (Mr, Ms, etc.)")
    other_name: Optional[str] = Field(None, description="Other names")
    date_of_birth: Optional[datetime] = Field(None, description="Date of birth")
    category_code: Optional[str] = Field(None, description="Patron category code")
    library_id: Optional[str] = Field(None, description="Home library ID")
    address: Optional[PatronAddress] = Field(None, description="Address")
    contact: Optional[PatronContact] = Field(None, description="Contact information")
    date_enrolled: Optional[datetime] = Field(None, description="Date enrolled")
    date_expiry: Optional[datetime] = Field(None, description="Card expiry date")
    restricted: bool = Field(False, description="Is patron restricted")
    
    class Config:
        json_schema_extra = {
            "example": {
                "patron_id": 456,
                "cardnumber": "LIB123456",
                "surname": "Nguyễn",
                "firstname": "Văn A",
                "category_code": "STUDENT"
            }
        }


class Checkout(BaseModel):
    """Book checkout record"""
    checkout_id: int = Field(description="Checkout ID")
    patron_id: int = Field(description="Patron ID")
    item_id: int = Field(description="Item ID")
    biblio_id: int = Field(description="Bibliographic record ID")
    title: Optional[str] = Field(None, description="Book title")
    author: Optional[str] = Field(None, description="Book author")
    barcode: Optional[str] = Field(None, description="Item barcode")
    call_number: Optional[str] = Field(None, description="Call number")
    checkout_date: datetime = Field(description="Date checked out")
    due_date: datetime = Field(description="Due date")
    return_date: Optional[datetime] = Field(None, description="Date returned")
    renewals: int = Field(0, description="Number of renewals")
    library_id: Optional[str] = Field(None, description="Checkout library")
    
    class Config:
        json_schema_extra = {
            "example": {
                "checkout_id": 789,
                "patron_id": 456,
                "item_id": 123,
                "biblio_id": 123,
                "title": "Lập trình Python",
                "due_date": "2024-12-31T00:00:00"
            }
        }


class Hold(BaseModel):
    """Book hold/reservation record"""
    hold_id: int = Field(description="Hold ID")
    patron_id: int = Field(description="Patron ID")
    biblio_id: int = Field(description="Bibliographic record ID")
    item_id: Optional[int] = Field(None, description="Specific item ID (if item-level hold)")
    title: Optional[str] = Field(None, description="Book title")
    author: Optional[str] = Field(None, description="Book author")
    hold_date: datetime = Field(description="Date hold was placed")
    expiration_date: Optional[datetime] = Field(None, description="Hold expiration date")
    pickup_library_id: str = Field(description="Library for pickup")
    priority: int = Field(description="Hold priority/queue position")
    status: str = Field(description="Hold status (waiting, in_transit, available, etc.)")
    waiting_date: Optional[datetime] = Field(None, description="Date became available")
    
    class Config:
        json_schema_extra = {
            "example": {
                "hold_id": 321,
                "patron_id": 456,
                "biblio_id": 123,
                "title": "Lập trình Python",
                "priority": 1,
                "status": "waiting"
            }
        }


class Library(BaseModel):
    """Library/branch information"""
    library_id: str = Field(description="Library code/ID")
    name: str = Field(description="Library name")
    address: Optional[str] = Field(None, description="Library address")
    city: Optional[str] = Field(None, description="City")
    postal_code: Optional[str] = Field(None, description="Postal code")
    phone: Optional[str] = Field(None, description="Phone number")
    email: Optional[str] = Field(None, description="Email address")
    url: Optional[str] = Field(None, description="Website URL")
    ip: Optional[str] = Field(None, description="IP address")
    notes: Optional[str] = Field(None, description="Notes")
    
    class Config:
        json_schema_extra = {
            "example": {
                "library_id": "MAIN",
                "name": "Thư viện chính",
                "address": "123 Đường ABC",
                "city": "Hà Nội"
            }
        }


class SearchResult(BaseModel):
    """Search results wrapper"""
    query: str = Field(description="Original search query")
    total: int = Field(description="Total number of results")
    page: int = Field(1, description="Current page")
    per_page: int = Field(20, description="Results per page")
    results: List[Book] = Field(default_factory=list, description="Search results")


class APIResponse(BaseModel):
    """Generic API response"""
    status: str = Field(description="Response status (success/error)")
    message: Optional[str] = Field(None, description="Response message")
    data: Optional[Dict[str, Any]] = Field(None, description="Response data")
    error: Optional[str] = Field(None, description="Error message if status is error")


class CirculationStats(BaseModel):
    """Circulation statistics"""
    total_checkouts: int = Field(0, description="Total checkouts")
    total_returns: int = Field(0, description="Total returns")
    total_renewals: int = Field(0, description="Total renewals")
    total_holds: int = Field(0, description="Total holds")
    active_patrons: int = Field(0, description="Number of active patrons")
    overdue_items: int = Field(0, description="Number of overdue items")
    start_date: Optional[datetime] = Field(None, description="Start date of statistics")
    end_date: Optional[datetime] = Field(None, description="End date of statistics")
