from pymongo import MongoClient
from config import MONGO_URI, MONGO_DB_NAME, MONGO_COLLECTION_NAME

def search_in_mongo(keyword: str, field: str = "any"):
    """Tìm kiếm trong MongoDB theo cấu trúc MARCJSON."""
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB_NAME]
    collection = db[MONGO_COLLECTION_NAME]

    field_map = {
        "any": [
            "fields.245.a", "fields.245.b",  # title
            "fields.100.a", "fields.700.a",  # author
            "fields.650.a",                  # subject
            "fields.260.b",                  # publisher
        ],
        "title": ["fields.245.a", "fields.245.b"],
        "author": ["fields.100.a", "fields.700.a"],
        "subject": ["fields.650.a"],
        "publisher": ["fields.260.b"],
        "date": ["fields.260.c"]
    }

    query_conditions = []
    for f in field_map.get(field, ["fields.245.a"]):
        query_conditions.append({f: {"$regex": keyword, "$options": "i"}})

    mongo_query = {"$or": query_conditions}

    result = collection.find_one(mongo_query)
    if result:
        result["_id"] = str(result["_id"])
    return result