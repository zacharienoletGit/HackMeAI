from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Unicode,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def maintenant_utc() -> datetime:
    return datetime.now(timezone.utc)


class UtilisateurDB(Base):
    __tablename__ = "Utilisateurs"

    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid4,
    )

    nom: Mapped[str] = mapped_column(
        Unicode(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        Unicode(255),
        nullable=False,
        unique=True,
        index=True,
    )

    quota_tokens: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=10_000,
    )

    est_actif: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    date_creation: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=maintenant_utc,
    )


class CleApiDB(Base):
    __tablename__ = "ClesAPI"

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

    # On conserve seulement le hash, jamais la vraie clé.
    cle_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        unique=True,
        index=True,
    )

    # Petit morceau visible pour identifier la clé.
    prefixe: Mapped[str] = mapped_column(
        String(12),
        nullable=False,
    )

    est_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    date_creation: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=maintenant_utc,
    )