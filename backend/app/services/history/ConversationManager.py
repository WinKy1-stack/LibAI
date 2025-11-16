import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from bson import ObjectId

from app.utils.mongo_helper import MongoHelper
from app.models.mongodb_schemas import get_conversation_schema

logger = logging.getLogger(__name__)


def _to_oid(maybe_id: Any) -> Any:
    try:
        return ObjectId(maybe_id)
    except Exception:
        return maybe_id


class ConversationManager:
    COLLECTION_NAME = "conversations"
    MESSAGES_COLLECTION = "messages"

    @staticmethod
    def create(
        user_id: str,
        channel: str = "web",
        model: str = None,
        lang: str = "vi",
    ) -> str:
        try:
            from flask import current_app
            
            if model is None:
                model = current_app.config.get('GEMINI_MODEL')
            
            conversation = get_conversation_schema()
            conversation["user_id"] = _to_oid(user_id)
            conversation["started_at"] = datetime.now(timezone.utc)
            conversation["ended_at"] = None
            conversation["meta"] = {"channel": channel, "model": model, "lang": lang}

            inserted_id = MongoHelper.insert_one(
                ConversationManager.COLLECTION_NAME, conversation
            )
            conv_id_str = str(inserted_id)
            logger.info("Created conversation %s for user %s", conv_id_str, user_id)
            return conv_id_str

        except Exception as e:
            logger.error("Error creating conversation: %s", str(e))
            raise

    @staticmethod
    def get_by_user(
        user_id: str,
        limit: int = 20,
        skip: int = 0,
    ) -> List[Dict[str, Any]]:
        try:
            uid = _to_oid(user_id)

            conversations = MongoHelper.find_many(
                ConversationManager.COLLECTION_NAME,
                query={"user_id": uid},
                sort=[("started_at", -1)],
                limit=limit,
                skip=skip,
            )

            # Bảo vệ khi DB trả về None
            if not conversations:
                conversations = []

            conv_ids: List[ObjectId] = []
            for conv in conversations:
                conv_oid = _to_oid(conv.get("_id"))
                if isinstance(conv_oid, ObjectId):
                    conv_ids.append(conv_oid)
                else:
                    logger.warning("Invalid conversation _id format: %s", conv.get("_id"))

            message_counts: Dict[str, int] = {}
            if conv_ids:
                pipeline = [
                    {"$match": {"conversation_id": {"$in": conv_ids}}},
                    {"$group": {"_id": "$conversation_id", "count": {"$sum": 1}}},
                ]
                counts = MongoHelper.aggregate(
                    ConversationManager.MESSAGES_COLLECTION, pipeline
                )
                message_counts = {str(c["_id"]): int(c["count"]) for c in counts}

            formatted: List[Dict[str, Any]] = []
            for conv in conversations:
                conv_oid = _to_oid(conv.get("_id"))
                conv_id_str = str(conv_oid)

                formatted.append(
                    {
                        "id": conv_id_str,
                        "conversation_id": conv_id_str,
                        "user_id": str(conv.get("user_id", "")),
                        "started_at": conv.get("started_at"),
                        "ended_at": conv.get("ended_at"),
                        "meta": conv.get("meta", {}),
                        "message_count": message_counts.get(conv_id_str, 0),
                    }
                )

            return formatted

        except Exception as e:
            logger.error("Error getting user conversations: %s", str(e))
            return []

    @staticmethod
    def end(conversation_id: str) -> bool:
        try:
            conv_id = _to_oid(conversation_id)
            result = MongoHelper.update_one(
                ConversationManager.COLLECTION_NAME,
                query={"_id": conv_id},
                update={"ended_at": datetime.now(timezone.utc)},
            )
            logger.info("Ended conversation %s (result=%s)", conversation_id, result)
            return result > 0

        except Exception as e:
            logger.error("Error ending conversation %s: %s", conversation_id, str(e))
            return False

    @staticmethod
    def delete(conversation_id: str, user_id: Optional[str] = None) -> bool:
        try:
            conv_oid = _to_oid(conversation_id)

            if user_id is not None:
                if not ConversationManager.belongs_to_user(conversation_id, user_id):
                    logger.warning(
                        "Delete denied: conversation %s does not belong to user %s",
                        conversation_id,
                        user_id,
                    )
                    return False

            MongoHelper.delete_many(
                ConversationManager.MESSAGES_COLLECTION, {"conversation_id": conv_oid}
            )
            deleted = MongoHelper.delete_one(
                ConversationManager.COLLECTION_NAME, {"_id": conv_oid}
            )

            logger.info(
                "Deleted conversation %s (and its messages). Count=%s",
                conversation_id,
                deleted,
            )
            return deleted > 0

        except Exception as e:
            logger.error("Error deleting conversation %s: %s", conversation_id, str(e))
            return False

    @staticmethod
    def get_stats(user_id: Optional[str] = None) -> Dict[str, Any]:
        try:
            query: Dict[str, Any] = {}
            if user_id:
                query["user_id"] = _to_oid(user_id)

            total = MongoHelper.count(
                ConversationManager.COLLECTION_NAME, query
            )
            active = MongoHelper.count(
                ConversationManager.COLLECTION_NAME, {**query, "ended_at": None}
            )

            stats = {
                "total_conversations": int(total),
                "active_conversations": int(active),
                "completed_conversations": int(total - active),
            }

            if user_id:
                stats["user_id"] = str(user_id)

            return stats

        except Exception as e:
            logger.error("Error getting conversation stats: %s", str(e))
            return {
                "total_conversations": 0,
                "active_conversations": 0,
                "completed_conversations": 0,
            }

    @staticmethod
    def get_all_ids_by_user(user_id: str) -> List[ObjectId]:
        try:
            uid = _to_oid(user_id)
            conversations = MongoHelper.find_many(
                ConversationManager.COLLECTION_NAME,
                query={"user_id": uid},
                projection={"_id": 1},
            )
            return [_to_oid(c["_id"]) for c in conversations]
        except Exception as e:
            logger.error("Error getting conversation IDs: %s", str(e))
            return []

    @staticmethod
    def belongs_to_user(conversation_id: str, user_id: str) -> bool:
        try:
            conv_id = _to_oid(conversation_id)
            conv = MongoHelper.find_one(
                ConversationManager.COLLECTION_NAME,
                query={"_id": conv_id},
            )
            if not conv:
                return False

            return str(conv.get("user_id")) == str(_to_oid(user_id))

        except Exception as e:
            logger.error("Error checking conversation ownership: %s", str(e))
            return False
