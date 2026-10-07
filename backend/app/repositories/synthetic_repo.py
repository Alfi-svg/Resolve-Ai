from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.user import User
from app.models.merchant import Merchant
from app.models.gateway import Gateway
from app.models.transaction import Transaction
from app.models.transaction_event import TransactionEvent
from app.models.support_case import SupportCase
from app.models.ai_investigation import AIInvestigation
from app.models.evidence import Evidence
from app.models.policy import Policy


class SyntheticRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_users(self) -> List[User]:
        res = await self.db.execute(select(User).order_by(User.id.asc()))
        return list(res.scalars().all())

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        res = await self.db.execute(select(User).where(User.id == user_id))
        return res.scalar_one_or_none()

    async def get_transactions(
        self,
        user_id: Optional[str] = None,
        status: Optional[str] = None,
        gateway_id: Optional[str] = None,
        merchant_id: Optional[str] = None,
        limit: int = 500,
        offset: int = 0
    ) -> List[Transaction]:
        query = select(Transaction).order_by(Transaction.created_at.desc())
        if user_id:
            query = query.where(Transaction.user_id == user_id)
        if status:
            query = query.where(Transaction.status == status)
        if gateway_id:
            query = query.where(Transaction.gateway_id == gateway_id)
        if merchant_id:
            query = query.where(Transaction.merchant_id == merchant_id)
        query = query.limit(limit).offset(offset)
        res = await self.db.execute(query)
        return list(res.scalars().all())

    async def get_transaction_by_id(self, transaction_id: str) -> Optional[Transaction]:
        res = await self.db.execute(select(Transaction).where(Transaction.id == transaction_id))
        return res.scalar_one_or_none()

    async def get_transaction_timeline(self, transaction_id: str) -> List[TransactionEvent]:
        query = (
            select(TransactionEvent)
            .where(TransactionEvent.transaction_id == transaction_id)
            .order_by(TransactionEvent.timestamp.asc())
        )
        res = await self.db.execute(query)
        return list(res.scalars().all())

    async def get_cases(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> List[SupportCase]:
        query = select(SupportCase).order_by(SupportCase.created_at.desc())
        if status:
            query = query.where(SupportCase.status == status)
        if priority:
            query = query.where(SupportCase.priority == priority)
        if user_id:
            query = query.where(SupportCase.user_id == user_id)
        res = await self.db.execute(query)
        return list(res.scalars().all())

    async def get_case_by_id(self, case_id: str) -> Optional[SupportCase]:
        res = await self.db.execute(select(SupportCase).where(SupportCase.id == case_id))
        return res.scalar_one_or_none()

    async def get_investigation_for_case(self, case_id: str) -> Optional[AIInvestigation]:
        res = await self.db.execute(select(AIInvestigation).where(AIInvestigation.case_id == case_id))
        return res.scalar_one_or_none()

    async def get_evidences_for_investigation(self, investigation_id: str) -> List[Evidence]:
        query = (
            select(Evidence)
            .where(Evidence.investigation_id == investigation_id)
            .order_by(Evidence.timestamp.asc())
        )
        res = await self.db.execute(query)
        return list(res.scalars().all())

    async def get_gateways(self) -> List[Gateway]:
        res = await self.db.execute(select(Gateway).order_by(Gateway.name.asc()))
        return list(res.scalars().all())

    async def get_merchants(self) -> List[Merchant]:
        res = await self.db.execute(select(Merchant).order_by(Merchant.name.asc()))
        return list(res.scalars().all())

    async def get_policies(self) -> List[Policy]:
        res = await self.db.execute(select(Policy).order_by(Policy.id.asc()))
        return list(res.scalars().all())
