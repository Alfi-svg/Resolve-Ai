from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.base import BaseRepository
from app.schemas.transaction import TransactionResponse

router = APIRouter()


@router.get("", response_model=List[TransactionResponse])
async def list_transactions(
    user_id: Optional[str] = Query(None, description="Filter transactions by user ID"),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve transactions list with optional user_id filter."""
    repo = BaseRepository(db)
    return await repo.get_transactions(user_id=user_id)


@router.get("/{trx_id}", response_model=TransactionResponse)
async def get_transaction(
    trx_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve detailed transaction by TRX ID."""
    repo = BaseRepository(db)
    tx = await repo.get_transaction_by_trx(trx_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx
