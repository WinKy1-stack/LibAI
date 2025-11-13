import logging
from app import mongo
from app.config import Config

logger = logging.getLogger(__name__)

def search_in_mongo(keyword: str, field: str = "any", limit: int = 10):
    """
    Tìm kiếm MARC21 Book Records trong MongoDB.
    - Hỗ trợ multi-field search
    - Regex không phân biệt hoa thường
    - Có limit và sort
    """
    if not keyword or not keyword.strip():
        return []

    collection = mongo.db[Config.COLLECTION_MARC_RECORDS]
    keyword = keyword.strip()

    field_map = {
        "any": [
            "title.main", "title.subtitle",
            "contributors.name", "subjects",
            "publication.publisher", "publication.place",
            "publication.year", "identifiers.isbn"
        ],
        "title": ["title.main", "title.subtitle"],
        "author": ["contributors.name"],
        "subject": ["subjects"],
        "publisher": ["publication.publisher"],
        "year": ["publication.year"],
        "isbn": ["identifiers.isbn"]
    }

    conditions = []
    for f in field_map.get(field, ["title.main"]):
        if f in ["subjects", "contributors.name", "identifiers.isbn"]:
            conditions.append({f: {"$elemMatch": {"$regex": keyword, "$options": "i"}}})
        else:
            conditions.append({f: {"$regex": keyword, "$options": "i"}})

    query = {"$or": conditions}

    try:
        cursor = collection.find(query).limit(limit).sort("publication.year", -1)
        results = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results

    except Exception as e:
        logger.error(f"Lỗi tìm kiếm MongoDB: {e}")
        return []
