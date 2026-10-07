import logging
import os
from pathlib import Path
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from app.core.config import settings, BASE_DIR

logger = logging.getLogger("upay_resolveai.db")

Base = declarative_base()

# Normalize SQLite path to always be absolute inside backend/
database_url = settings.DATABASE_URL
if database_url.startswith("sqlite") and ":///" in database_url:
    path_part = database_url.split(":///", 1)[1]
    if not os.path.isabs(path_part):
        abs_sqlite_path = (BASE_DIR / path_part.lstrip("./")).resolve()
        database_url = f"sqlite+aiosqlite:///{abs_sqlite_path}"

# Configure engine with robust fallback
engine_kwargs = {"echo": False, "future": True}

if database_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_async_engine(database_url, **engine_kwargs)
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def check_db_connection() -> dict:
    """Checks the database connectivity and returns engine details."""
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            val = result.scalar()
            dialect = engine.dialect.name
            return {
                "status": "connected" if val == 1 else "unhealthy",
                "dialect": dialect,
                "database_url_type": "postgresql" if "postgres" in database_url else "sqlite",
                "healthy": True
            }
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return {
            "status": "error",
            "error": str(e),
            "healthy": False
        }


async def init_db():
    """Initializes tables if they do not exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
