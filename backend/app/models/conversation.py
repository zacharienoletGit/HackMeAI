from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Unicode,
    UnicodeText,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def maintenant_utc() -> datetime:
    return datetime.now(timezone.utc)


class ConversationDB(Base):
    __tablename__ = "Conversations"

    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid4,
    )

    utilisateur_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey(
            "Utilisateurs.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    date_creation: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=maintenant_utc,
        nullable=False,
    )

    date_modification: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=maintenant_utc,
        onupdate=maintenant_utc,
        nullable=False,
    )


class MessageDB(Base):
    __tablename__ = "Messages"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    conversation_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey(
            "Conversations.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    role: Mapped[str] = mapped_column(
        Unicode(20),
        nullable=False,
    )

    contenu: Mapped[str] = mapped_column(
        UnicodeText,
        nullable=False,
    )

    date_creation: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=maintenant_utc,
        nullable=False,
    )
