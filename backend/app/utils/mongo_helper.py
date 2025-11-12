from datetime import datetime, timezone
from bson import ObjectId
from pymongo import ReturnDocument
from app import mongo
import logging

logger = logging.getLogger(__name__)

class MongoHelper:
    """Helper class để thao tác MongoDB an toàn và rõ ràng hơn"""

    @staticmethod
    def _get_collection(name):
        return mongo.db[name]

    @staticmethod
    def _ensure_objectid(doc_or_id):
        """Chuyển string ID thành ObjectId nếu cần"""
        if isinstance(doc_or_id, str):
            try:
                return ObjectId(doc_or_id)
            except Exception:
                return doc_or_id
        if isinstance(doc_or_id, dict) and '_id' in doc_or_id and isinstance(doc_or_id['_id'], str):
            doc_or_id['_id'] = ObjectId(doc_or_id['_id'])
        return doc_or_id

    @staticmethod
    def _serialize(doc):
        """Convert ObjectId → str"""
        if not doc:
            return None
        if isinstance(doc, list):
            return [{**d, "_id": str(d["_id"])} if "_id" in d else d for d in doc]
        if "_id" in doc and isinstance(doc["_id"], ObjectId):
            doc["_id"] = str(doc["_id"])
        return doc

    @staticmethod
    def insert_one(name, doc):
        col = MongoHelper._get_collection(name)
        now = datetime.now(timezone.utc)
        doc.setdefault("created_at", now)
        doc.setdefault("updated_at", now)
        result = col.insert_one(doc)
        return str(result.inserted_id)

    @staticmethod
    def insert_many(name, docs):
        if not docs:
            return []
        col = MongoHelper._get_collection(name)
        now = datetime.now(timezone.utc)
        for d in docs:
            d.setdefault("created_at", now)
            d.setdefault("updated_at", now)
        result = col.insert_many(docs)
        return [str(_id) for _id in result.inserted_ids]

    @staticmethod
    def find_one(name, query=None, projection=None):
        col = MongoHelper._get_collection(name)
        query = MongoHelper._ensure_objectid(query or {})
        doc = col.find_one(query, projection)
        return MongoHelper._serialize(doc)

    @staticmethod
    def find_many(name, query=None, projection=None, sort=None, limit=None, skip=None):
        col = MongoHelper._get_collection(name)
        query = MongoHelper._ensure_objectid(query or {})
        cursor = col.find(query, projection)
        if sort:
            if isinstance(sort, dict):
                sort = list(sort.items())
            cursor = cursor.sort(sort)
        if skip:
            cursor = cursor.skip(skip)
        if limit:
            cursor = cursor.limit(limit)
        return MongoHelper._serialize(list(cursor))

    @staticmethod
    def update_one(name, query, update, upsert=False):
        col = MongoHelper._get_collection(name)
        query = MongoHelper._ensure_objectid(query)
        if "$set" not in update and not any(k.startswith("$") for k in update):
            update = {"$set": update}
        update["$set"] = {**update.get("$set", {}), "updated_at": datetime.now(timezone.utc)}
        result = col.update_one(query, update, upsert=upsert)
        return result.modified_count

    @staticmethod
    def find_one_and_update(name, query, update, *, upsert=False, after=True):
        col = MongoHelper._get_collection(name)
        query = MongoHelper._ensure_objectid(query)
        if "$set" not in update and not any(k.startswith("$") for k in update):
            update = {"$set": update}
        update["$set"] = {**update.get("$set", {}), "updated_at": datetime.now(timezone.utc)}
        doc = col.find_one_and_update(
            query,
            update,
            return_document=ReturnDocument.AFTER if after else ReturnDocument.BEFORE,
            upsert=upsert
        )
        return MongoHelper._serialize(doc)

    @staticmethod
    def update_many(name, query, update):
        col = MongoHelper._get_collection(name)
        query = MongoHelper._ensure_objectid(query)
        if "$set" not in update and not any(k.startswith("$") for k in update):
            update = {"$set": update}
        update["$set"] = {**update.get("$set", {}), "updated_at": datetime.now(timezone.utc)}
        result = col.update_many(query, update)
        return result.modified_count

    @staticmethod
    def delete_one(name, query):
        col = MongoHelper._get_collection(name)
        query = MongoHelper._ensure_objectid(query)
        return col.delete_one(query).deleted_count

    @staticmethod
    def delete_many(name, query):
        col = MongoHelper._get_collection(name)
        query = MongoHelper._ensure_objectid(query)
        return col.delete_many(query).deleted_count

    @staticmethod
    def count(name, query=None):
        col = MongoHelper._get_collection(name)
        return col.count_documents(query or {})

    @staticmethod
    def aggregate(name, pipeline):
        col = MongoHelper._get_collection(name)
        result = list(col.aggregate(pipeline))
        return MongoHelper._serialize(result)

    @staticmethod
    def create_index(name, keys, **kwargs):
        col = MongoHelper._get_collection(name)
        return col.create_index(keys, **kwargs)

    @staticmethod
    def list_collections():
        return mongo.db.list_collection_names()

    @staticmethod
    def drop_collection(name):
        return mongo.db.drop_collection(name)
