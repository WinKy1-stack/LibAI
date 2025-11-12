from pymongo import MongoClient
from app.config import Config


def search_in_mongo(keyword: str, field: str = "any"):
    """Tìm kiếm trong MongoDB theo cấu trúc MARC21 Book Record format."""
    client = MongoClient(Config.MONGO_URI)
    db = client[Config.MONGO_DBNAME]
    collection = db[Config.COLLECTION_MARC_RECORDS]  # Uses marc_21
    field_map = {
        "any": [
            "title.main", "title.subtitle",  # title
            "contributors.name",              # author/contributors
            "subjects",                       # subject (array)
            "publication.publisher",          # publisher
            "publication.place",              # place
        ],
        "title": ["title.main", "title.subtitle"],
        "author": ["contributors.name"],
        "subject": ["subjects"],
        "publisher": ["publication.publisher"],
        "date": ["publication.year"],
        "isbn": ["identifiers.isbn"]
    }

    query_conditions = []
    for f in field_map.get(field, ["title.main"]):
        # For array fields like subjects, use $in or $elemMatch
        if f == "subjects" or f == "identifiers.isbn" or f == "contributors.name":
            query_conditions.append({f: {"$regex": keyword, "$options": "i"}})
        else:
            query_conditions.append({f: {"$regex": keyword, "$options": "i"}})

    mongo_query = {"$or": query_conditions}

    result = collection.find_one(mongo_query)
    if result:
        result["_id"] = str(result["_id"])
    return result