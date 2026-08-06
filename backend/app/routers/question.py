from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import obtenir_session
from ..dependencies.limit import (
    enregistrer_tokens,
    verifier_rate_limit,
    verifier_quota,
)
from ..dependencies.security import (
    Utilisateur,
    obtenir_utilisateur,
)
from ..models.prompt import (
    HistoriqueReponse,
    MessageHistorique,
    Prompt,
    Reponse,
)
from ..services.historique import (
    enregistrer_echange,
    obtenir_messages,
    obtenir_ou_creer_conversation,
)
from ..services.llama import appeler_llama


router = APIRouter(
    prefix="/questionner",
    tags=["IA"],
)


@router.post(
    "",
    response_model=Reponse,
    status_code=200,
)
async def questionner(
    prompt: Prompt,
    utilisateur: Utilisateur = Depends(
        obtenir_utilisateur
    ),
    session: AsyncSession = Depends(
        obtenir_session
    ),
) -> Reponse:
    await verifier_rate_limit(
        utilisateur_id=str(utilisateur.id),
    )

    await verifier_quota(
        utilisateur_id=str(utilisateur.id),
        tokens_demandes=prompt.max_tokens,
        quota_tokens=utilisateur.quota_tokens,
    )

    conversation_id = (
        await obtenir_ou_creer_conversation(
            session=session,
            utilisateur_id=utilisateur.id,
            conversation_id=prompt.conversation_id,
        )
    )

    messages_db = await obtenir_messages(
        session=session,
        utilisateur_id=utilisateur.id,
        conversation_id=conversation_id,
    )

    historique = [
        MessageHistorique.model_validate(message)
        for message in messages_db
    ]

    texte, tokens_utilises = await appeler_llama(
        prompt=prompt,
        historique=historique,
    )

    await enregistrer_echange(
        session=session,
        conversation_id=conversation_id,
        question=prompt.contenu,
        reponse=texte,
    )

    await enregistrer_tokens(
        utilisateur_id=str(utilisateur.id),
        tokens_utilises=tokens_utilises,
    )

    return Reponse(
        reponse=texte,
        conversation_id=conversation_id,
    )


@router.get(
    "/historique/{conversation_id}",
    response_model=HistoriqueReponse,
)
async def lire_historique(
    conversation_id: UUID,
    utilisateur: Utilisateur = Depends(
        obtenir_utilisateur
    ),
    session: AsyncSession = Depends(
        obtenir_session
    ),
) -> HistoriqueReponse:
    messages_db = await obtenir_messages(
        session=session,
        utilisateur_id=utilisateur.id,
        conversation_id=conversation_id,
    )

    messages = [
        MessageHistorique.model_validate(message)
        for message in messages_db
    ]

    return HistoriqueReponse(
        conversation_id=conversation_id,
        messages=messages,
    )
