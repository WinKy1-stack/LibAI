
"""
Conversation Operations - Quản lý conversations trong MongoDB
- Chuẩn hóa xử lý ObjectId
- Đếm message per conversation chính xác
- Thêm delete() xóa kèm toàn bộ messages (cascade)
- Các hàm tiện ích: create, get_by_user, end, get_stats, get_all_ids_by_user, belongs_to_user
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from bson import ObjectId

from app.utils.mongo_helper import MongoHelper  # type: ignore
from app.models.mongodb_schemas import get_conversation_schema  # type: ignore

logger = logging.getLogger(__name__)


def _to_oid(maybe_id: Any) -> Any:
    """Convert về ObjectId nếu có thể, nếu không thì trả nguyên giá trị."""
    try:
        return ObjectId(maybe_id)
    except Exception:
        return maybe_id


class ConversationManager:
    """Quản lý conversation operations"""

    COLLECTION_NAME = "conversations"
    MESSAGES_COLLECTION = "messages"

    # ---------------------------------------------------------------------
    # CREATE
    # ---------------------------------------------------------------------
    @staticmethod
    def create(
        user_id: str,
        channel: str = "web",
        model: str = "gemini-2.0-flash-exp",
        lang: str = "vi",
    ) -> str:
        """Tạo conversation mới và trả về id dạng string."""
        try:
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

    # ---------------------------------------------------------------------
    # READ (list by user) + message counts
    # ---------------------------------------------------------------------
    @staticmethod
    def get_by_user(
        user_id: str,
        limit: int = 20,
        skip: int = 0,
    ) -> List[Dict[str, Any]]:
        """Trả danh sách conversations của user + tổng số tin nhắn."""
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
                    # Log từng conversation có _id không hợp lệ
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

            logger.debug(
                "Retrieved %d conversations for user %s", len(formatted), user_id
            )
            return formatted

        except Exception as e:
            logger.error("Error getting user conversations: %s", str(e))
            return []

    # ---------------------------------------------------------------------
    # END (mark completed)
    # ---------------------------------------------------------------------
    @staticmethod
    def end(conversation_id: str) -> bool:
        """Đánh dấu conversation đã kết thúc."""
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

    # ---------------------------------------------------------------------
    # DELETE (cascade messages) + optional ownership check
    # ---------------------------------------------------------------------
    @staticmethod
    def delete(conversation_id: str, user_id: Optional[str] = None) -> bool:
        """
        Xóa 1 conversation và toàn bộ messages của nó.
        Nếu truyền user_id -> kiểm tra quyền sở hữu trước khi xóa.
        """
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

    # ---------------------------------------------------------------------
    # STATS
    # ---------------------------------------------------------------------
    @staticmethod
    def get_stats(user_id: Optional[str] = None) -> Dict[str, Any]:
        """Thống kê conversations."""
        try:
            query: Dict[str, Any] = {}
            if user_id:
                query["user_id"] = _to_oid(user_id)

            total_conversations = MongoHelper.count_documents(
                ConversationManager.COLLECTION_NAME, query
            )
            active_query = {**query, "ended_at": None}
            active_count = MongoHelper.count_documents(
                ConversationManager.COLLECTION_NAME, active_query
            )

            stats = {
                "total_conversations": int(total_conversations),
                "active_conversations": int(active_count),
                "completed_conversations": int(total_conversations - active_count),
            }
            if user_id:
                stats["user_id"] = str(user_id)

            logger.debug("Generated conversation stats: %s", stats)
            return stats

        except Exception as e:
            logger.error("Error getting conversation stats: %s", str(e))
            return {
                "total_conversations": 0,
                "active_conversations": 0,
                "completed_conversations": 0,
            }

    # ---------------------------------------------------------------------
    # GET ALL IDS
    # ---------------------------------------------------------------------
    @staticmethod
    def get_all_ids_by_user(user_id: str) -> List[ObjectId]:
        """Lấy tất cả conversation _id (ObjectId) của user."""
        try:
            uid = _to_oid(user_id)
            conversations = MongoHelper.find_many(
                ConversationManager.COLLECTION_NAME,
                query={"user_id": uid},
                projection={"_id": 1},
            )
            ids: List[ObjectId] = []
            for c in conversations:
                ids.append(_to_oid(c["_id"]))
            return ids
        except Exception as e:
            logger.error("Error getting conversation IDs: %s", str(e))
            return []

    # ---------------------------------------------------------------------
    # OWNERSHIP CHECK (robust)
    # ---------------------------------------------------------------------
    @staticmethod
    def belongs_to_user(conversation_id: str, user_id: str) -> bool:
        """
        Kiểm tra conversation thuộc user đang đăng nhập:
        - Lấy conversation theo _id
        - So sánh conv.user_id và user_id ở dạng chuỗi
        """
        try:
            conv_id = _to_oid(conversation_id)
            conv = MongoHelper.find_one(
                ConversationManager.COLLECTION_NAME,
                query={"_id": conv_id},
            )
            if not conv:
                return False

            conv_user_str = str(conv.get("user_id"))
            user_id_str = str(_to_oid(user_id))
            return conv_user_str == user_id_str
        except Exception as e:
            logger.error("Error checking conversation ownership: %s", str(e))
            return False
