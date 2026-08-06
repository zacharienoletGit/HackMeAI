import hashlib
import os
import secrets
from uuid import UUID

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import obtenir_session
from app.models.user_database import CleApiDB, UtilisateurDB


api_key_header = APIKeyHeader(
    name="APIKEY",
    auto_error=False,
)

admin_key_header = APIKeyHeader(
    name="ADMINKEY",
    auto_error=False,
)


class Utilisateur(BaseModel):
    id: UUID
    quota_tokens: int


def calculer_hash_cle(cle_api: str) -> str:
    return hashlib.sha256(
        cle_api.encode("utf-8")
    ).hexdigest()


async def verifier_admin(
    admin_key: str | None = Security(admin_key_header),
) -> None:
    cle_attendue = os.getenv("ADMIN_API_KEY")

    if not cle_attendue:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ADMIN_API_KEY n'est pas configurée dans le backend.",
        )

    if admin_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Le header ADMINKEY est manquant.",
        )

    if not secrets.compare_digest(
        admin_key,
        cle_attendue,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clé administrateur invalide.",
        )


async def obtenir_utilisateur(
    api_key: str | None = Security(api_key_header),
    session: AsyncSession = Depends(obtenir_session),
) -> Utilisateur:
    if api_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Le header APIKEY est manquant.",
        )

    cle_hash = calculer_hash_cle(api_key)

    requete = (
        select(UtilisateurDB)
        .join(
            CleApiDB,
            CleApiDB.utilisateur_id == UtilisateurDB.id,
        )
        .where(
            CleApiDB.cle_hash == cle_hash,
            CleApiDB.est_active.is_(True),
            UtilisateurDB.est_actif.is_(True),
        )
    )

    resultat = await session.execute(requete)
    utilisateur = resultat.scalar_one_or_none()

    if utilisateur is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Clé API invalide.",
        )

    return Utilisateur(
        id=utilisateur.id,
        quota_tokens=utilisateur.quota_tokens,
    )
