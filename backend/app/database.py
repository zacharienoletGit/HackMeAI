import os
from collections.abc import AsyncGenerator

from sqlalchemy import URL
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


def construire_database_url() -> str | URL:
    database_url_env = os.getenv("DATABASE_URL")

    if database_url_env:
        return database_url_env

    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")

    if db_user and db_password:
        return URL.create(
            drivername="mysql+asyncmy",
            username=db_user,
            password=db_password,
            host=os.getenv("DB_SERVER", "127.0.0.1"),
            port=int(os.getenv("DB_PORT", "3306")),
            database=os.getenv("DB_NAME", "HackMeAi"),
            query={
                "charset": "utf8mb4",
            },
        )

    return "sqlite+aiosqlite:///./hackmeai.db"


engine = create_async_engine(
    construire_database_url(),
    echo=False,
    pool_pre_ping=True,
)


SessionLocale = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def obtenir_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocale() as session:
        yield session


async def initialiser_base_donnees() -> None:
    from app.models.conversation import (
        ConversationDB,
        MessageDB,
    )
    from app.models.user_database import (
        CleApiDB,
        UtilisateurDB,
    )

    async with engine.begin() as connexion:
        await connexion.run_sync(Base.metadata.create_all)
