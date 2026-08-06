import hashlib
import secrets

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import obtenir_session
from app.dependencies.security import verifier_admin
from app.models.user_database import (
    CleApiDB,
    UtilisateurDB,
)
from app.models.user import (
    UtilisateurCreation,
    UtilisateurCree,
)

router = APIRouter(
    prefix="/utilisateurs",
    tags=["Utilisateurs"],
)


def creer_cle_api() -> str:
    """
    Génère une clé difficile à deviner.
    """
    return f"hmai_{secrets.token_urlsafe(32)}"


def calculer_hash_cle(cle_api: str) -> str:
    return hashlib.sha256(
        cle_api.encode("utf-8")
    ).hexdigest()


@router.post(
    "",
    response_model=UtilisateurCree,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(verifier_admin)],
)
async def creer_utilisateur(
    donnees: UtilisateurCreation,
    session: AsyncSession = Depends(obtenir_session),
) -> UtilisateurCree:
    email_normalise = str(donnees.email).lower()

    requete = select(UtilisateurDB).where(
        UtilisateurDB.email == email_normalise
    )

    resultat = await session.execute(requete)
    utilisateur_existant = resultat.scalar_one_or_none()

    if utilisateur_existant is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un utilisateur possède déjà ce courriel.",
        )

    # La vraie clé est retournée une seule fois; après ça, on garde seulement le hash.
    cle_api = creer_cle_api()
    cle_hash = calculer_hash_cle(cle_api)

    utilisateur = UtilisateurDB(
        nom=donnees.nom,
        email=email_normalise,
        quota_tokens=donnees.quota_tokens,
        est_actif=True,
    )

    session.add(utilisateur)

    try:
        # Je fais le flush ici pour avoir l'UUID avant de créer la clé liée.
        await session.flush()

        cle_api_db = CleApiDB(
            utilisateur_id=utilisateur.id,
            cle_hash=cle_hash,
            prefixe=cle_api[:12],
            est_active=True,
        )

        session.add(cle_api_db)

        await session.commit()
        await session.refresh(utilisateur)

    except IntegrityError as error:
        await session.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Impossible de créer cet utilisateur.",
        ) from error

    except Exception:
        await session.rollback()
        raise

    return UtilisateurCree(
        id=utilisateur.id,
        nom=utilisateur.nom,
        email=utilisateur.email,
        quota_tokens=utilisateur.quota_tokens,
        est_actif=utilisateur.est_actif,
        date_creation=utilisateur.date_creation,
        api_key=cle_api,
    )
