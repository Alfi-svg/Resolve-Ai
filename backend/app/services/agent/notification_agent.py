import logging
import uuid
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.notification import Notification

logger = logging.getLogger("upay_resolveai.agent.notification_agent")


class NotificationAgent:
    """
    Autonomous Customer & Admin Notification Dispatcher.
    Keeps customer informed at every stage of the self-healing transaction loop:
    anomaly detection -> ongoing investigation -> admin approval -> fund reconciliation.
    """

    # In-memory fallback cache so notifications never fail if DB is busy
    _MEMORY_NOTIFICATIONS: List[Dict[str, Any]] = [
        {
            "id": "NOTIF-INIT-01",
            "user_id": "USR-001",
            "title": "ResolveAI Active Protection",
            "message": "Real-time AI monitoring is active for your Upay account. All transactions are verified instantaneously.",
            "type": "AGENT_ALERT",
            "related_id": "UPAY-SYSTEM",
            "is_read": False,
            "created_at": datetime.datetime.utcnow().isoformat() + "Z"
        }
    ]

    @classmethod
    async def notify_user(
        cls,
        user_id: str,
        title: str,
        message: str,
        notif_type: str = "AGENT_ALERT",
        related_id: Optional[str] = None,
        db: Optional[AsyncSession] = None
    ) -> Dict[str, Any]:
        """
        Creates and sends a real-time notification to the customer.
        """
        notif_id = f"NOTIF-{uuid.uuid4().hex[:8].upper()}"
        now_dt = datetime.datetime.utcnow()
        notif_data = {
            "id": notif_id,
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": notif_type,
            "related_id": related_id,
            "is_read": False,
            "created_at": now_dt.isoformat() + "Z"
        }

        # Keep in memory
        cls._MEMORY_NOTIFICATIONS.insert(0, notif_data)

        # Persist to database if available
        if db:
            try:
                db_notif = Notification(
                    id=notif_id,
                    user_id=user_id,
                    title=title,
                    message=message,
                    type=notif_type,
                    related_id=related_id,
                    is_read=False,
                    created_at=now_dt
                )
                db.add(db_notif)
                await db.commit()
            except Exception as e:
                logger.error(f"Error persisting notification to DB: {e}")
                await db.rollback()

        return notif_data

    @classmethod
    async def get_user_notifications(
        cls,
        user_id: str = "USR-001",
        db: Optional[AsyncSession] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves notifications for a given user.
        """
        if db:
            try:
                q = select(Notification).where(Notification.user_id == user_id).order_by(desc(Notification.created_at)).limit(20)
                res = await db.execute(q)
                db_items = res.scalars().all()
                if db_items:
                    return [
                        {
                            "id": n.id,
                            "user_id": n.user_id,
                            "title": n.title,
                            "message": n.message,
                            "type": n.type,
                            "related_id": n.related_id,
                            "is_read": n.is_read,
                            "created_at": n.created_at.isoformat() + "Z" if n.created_at else datetime.datetime.utcnow().isoformat() + "Z"
                        }
                        for n in db_items
                    ]
            except Exception as e:
                logger.warning(f"Could not load notifications from DB, falling back to memory: {e}")

        # Fallback to in-memory notifications
        return [n for n in cls._MEMORY_NOTIFICATIONS if n.get("user_id") == user_id]

    @classmethod
    async def mark_all_read(cls, user_id: str = "USR-001", db: Optional[AsyncSession] = None) -> bool:
        for n in cls._MEMORY_NOTIFICATIONS:
            if n.get("user_id") == user_id:
                n["is_read"] = True
        if db:
            try:
                # Update in db
                res = await db.execute(select(Notification).where(Notification.user_id == user_id))
                items = res.scalars().all()
                for item in items:
                    item.is_read = True
                await db.commit()
            except Exception as e:
                logger.error(f"Failed to mark notifications read in db: {e}")
        return True


notification_agent = NotificationAgent()
