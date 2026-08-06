from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.conversation import (
    ConversationDB,
    MessageDB,
)


async def obtenir_ou_creer_conversation(
    session: AsyncSession,
    utilisateur_id: UUID,
    conversation_id: UUID | None,
) -> UUID:
    if conversation_id is None:
        nouvelle_id = uuid4()
        maintenant = datetime.now(timezone.utc)

        conversation = ConversationDB(
            id=nouvelle_id,
            utilisateur_id=utilisateur_id,
            date_creation=maintenant,
            date_modification=maintenant,
        )

        session.add(conversation)

        try:
            await session.commit()
        except Exception:
            await session.rollback()
            raise

        return nouvelle_id

    requete = select(ConversationDB).where(
        ConversationDB.id == conversation_id,
        ConversationDB.utilisateur_id == utilisateur_id,
    )

    resultat = await session.execute(requete)
    conversation = resultat.scalar_one_or_none()

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation introuvable.",
        )

    return conversation.id


async def obtenir_messages(
    session: AsyncSession,
    utilisateur_id: UUID,
    conversation_id: UUID,
) -> list[MessageDB]:
    await obtenir_ou_creer_conversation(
        session=session,
        utilisateur_id=utilisateur_id,
        conversation_id=conversation_id,
    )

    requete = (
        select(MessageDB)
        .where(
            MessageDB.conversation_id == conversation_id
        )
        .order_by(
            MessageDB.date_creation.asc(),
            MessageDB.id.asc(),
        )
    )

    resultat = await session.execute(requete)
    return list(resultat.scalars().all())


async def enregistrer_echange(
    session: AsyncSession,
    conversation_id: UUID,
    question: str,
    reponse: str,
) -> None:
    maintenant = datetime.now(timezone.utc)

    requete = select(ConversationDB).where(
        ConversationDB.id == conversation_id
    )
    resultat = await session.execute(requete)
    conversation = resultat.scalar_one_or_none()

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation introuvable.",
        )

    conversation.date_modification = maintenant

    session.add_all(
        [
            MessageDB(
                conversation_id=conversation_id,
                role="user",
                contenu=question,
                date_creation=maintenant,
            ),
            MessageDB(
                conversation_id=conversation_id,
                role="assistant",
                contenu=reponse,
                date_creation=datetime.now(timezone.utc),
            ),
        ]
    )

    try:
        await session.commit()
    except Exception:
        await session.rollback()
        raise
