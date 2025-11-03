"""
MongoDB Utilities
"""
from app import mongo
from bson import ObjectId
from datetime import datetime, timezone

class MongoHelper:
    """Helper class để làm việc với MongoDB"""
    
    @staticmethod
    def get_collection(collection_name):
        """Lấy collection từ MongoDB"""
        return mongo.db[collection_name]
    
    @staticmethod
    def insert_one(collection_name, document):
        """Insert một document vào collection"""
        collection = MongoHelper.get_collection(collection_name)
        # Chỉ thêm timestamps nếu chưa có
        if 'created_at' not in document:
            document['created_at'] = datetime.now(timezone.utc)
        if 'updated_at' not in document:
            document['updated_at'] = datetime.now(timezone.utc)
        result = collection.insert_one(document)
        return result.inserted_id
    
    @staticmethod
    def insert_many(collection_name, documents):
        """Insert nhiều documents vào collection"""
        collection = MongoHelper.get_collection(collection_name)
        for doc in documents:
            doc['created_at'] = datetime.now(timezone.utc)
            doc['updated_at'] = datetime.now(timezone.utc)
        result = collection.insert_many(documents)
        return [str(id) for id in result.inserted_ids]
    
    @staticmethod
    def find_one(collection_name, query=None, projection=None):
        """Tìm một document"""
        collection = MongoHelper.get_collection(collection_name)
        if query is None:
            query = {}
        # Convert string _id to ObjectId if present
        if '_id' in query and isinstance(query['_id'], str):
            query['_id'] = ObjectId(query['_id'])
        doc = collection.find_one(query, projection)
        if doc and '_id' in doc:
            doc['_id'] = str(doc['_id'])
        return doc
    
    @staticmethod
    def find_many(collection_name, query=None, projection=None, sort=None, limit=None, skip=None):
        """Tìm nhiều documents"""
        collection = MongoHelper.get_collection(collection_name)
        if query is None:
            query = {}
        
        cursor = collection.find(query, projection)
        
        if sort:
            cursor = cursor.sort(sort)
        if skip:
            cursor = cursor.skip(skip)
        if limit:
            cursor = cursor.limit(limit)
        
        docs = list(cursor)
        for doc in docs:
            if '_id' in doc:
                doc['_id'] = str(doc['_id'])
        return docs
    
    @staticmethod
    def update_one(collection_name, query, update):
        """Update một document"""
        collection = MongoHelper.get_collection(collection_name)
        if '_id' in query and isinstance(query['_id'], str):
            query['_id'] = ObjectId(query['_id'])
        
        if '$set' not in update:
            update = {'$set': update}
        
        update['$set']['updated_at'] = datetime.now(timezone.utc)
        result = collection.update_one(query, update)
        return result.modified_count
    
    @staticmethod
    def update_many(collection_name, query, update):
        """Update nhiều documents"""
        collection = MongoHelper.get_collection(collection_name)
        
        if '$set' not in update:
            update = {'$set': update}
        
        update['$set']['updated_at'] = datetime.now(timezone.utc)
        result = collection.update_many(query, update)
        return result.modified_count
    
    @staticmethod
    def delete_one(collection_name, query):
        """Xóa một document"""
        collection = MongoHelper.get_collection(collection_name)
        if '_id' in query and isinstance(query['_id'], str):
            query['_id'] = ObjectId(query['_id'])
        result = collection.delete_one(query)
        return result.deleted_count
    
    @staticmethod
    def delete_many(collection_name, query):
        """Xóa nhiều documents"""
        collection = MongoHelper.get_collection(collection_name)
        result = collection.delete_many(query)
        return result.deleted_count
    
    @staticmethod
    def count_documents(collection_name, query=None):
        """Đếm số lượng documents"""
        collection = MongoHelper.get_collection(collection_name)
        if query is None:
            query = {}
        return collection.count_documents(query)
    
    @staticmethod
    def aggregate(collection_name, pipeline):
        """Thực hiện aggregation pipeline"""
        collection = MongoHelper.get_collection(collection_name)
        result = list(collection.aggregate(pipeline))
        for doc in result:
            if '_id' in doc and isinstance(doc['_id'], ObjectId):
                doc['_id'] = str(doc['_id'])
        return result
    
    @staticmethod
    def create_index(collection_name, keys, **kwargs):
        """Tạo index cho collection"""
        collection = MongoHelper.get_collection(collection_name)
        return collection.create_index(keys, **kwargs)
    
    @staticmethod
    def list_collections():
        """Liệt kê tất cả collections"""
        return mongo.db.list_collection_names()
    
    @staticmethod
    def drop_collection(collection_name):
        """Xóa một collection"""
        return mongo.db.drop_collection(collection_name)
