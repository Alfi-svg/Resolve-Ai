from typing import List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.transaction import Transaction
from app.models.dispute import Dispute
from app.models.risk_case import RiskCase


class BaseRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_users(self) -> List[User]:
        res = await self.db.execute(select(User))
        return list(res.scalars().all())

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        res = await self.db.execute(select(User).where(User.id == user_id))
        return res.scalar_one_or_none()

    async def get_transactions(self, user_id: Optional[str] = None) -> List[Transaction]:
        query = select(Transaction).order_by(Transaction.created_at.desc())
        if user_id:
            query = query.where(Transaction.user_id == user_id)
        res = await self.db.execute(query)
        return list(res.scalars().all())

    async def get_transaction_by_trx(self, trx_id: str) -> Optional[Transaction]:
        res = await self.db.execute(select(Transaction).where(Transaction.trx_id == trx_id))
        return res.scalar_one_or_none()

    async def get_disputes(self, user_id: Optional[str] = None) -> List[Dispute]:
        query = select(Dispute).order_by(Dispute.created_at.desc())
        if user_id:
            query = query.where(Dispute.user_id == user_id)
        res = await self.db.execute(query)
        return list(res.scalars().all())

    async def get_risk_cases(self) -> List[RiskCase]:
        query = select(RiskCase).order_by(RiskCase.created_at.desc())
        res = await self.db.execute(query)
        return list(res.scalars().all())

    async def create_dispute(self, dispute_data: dict) -> Dispute:
        dispute = Dispute(**dispute_data)
        self.db.add(dispute)
        await self.db.commit()
        await self.db.refresh(dispute)
        return dispute
