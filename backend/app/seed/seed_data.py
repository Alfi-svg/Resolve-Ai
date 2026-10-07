import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.seed.synthetic_engine import generate_synthetic_fintech_dataset

logger = logging.getLogger("upay_resolveai.seed")


async def seed_initial_data(db: AsyncSession, force_refresh: bool = False):
    """Entry point for seeding the Upay ResolveAI synthetic dataset."""
    logger.info("Initializing Upay ResolveAI synthetic data engine...")
    await generate_synthetic_fintech_dataset(db, force_refresh=force_refresh)
    logger.info("Upay ResolveAI synthetic data engine initialized successfully.")
