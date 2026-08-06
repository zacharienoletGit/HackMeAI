import os
import asyncio

import httpx
from fastapi import HTTPException
from pydantic import BaseModel, Field, ValidationError

from ..models.prompt import Prompt, MessageHistorique

LLAMA_API_URL = os.getenv("LLAMA_API_URL")
LLAMA_MODEL = os.getenv(
    "LLAMA_MODEL",
    "Dolphin3.0-Llama3.1-8B-abliterated.Q4_K_S",
)
LLAMA_CONNECT_TIMEOUT = float(os.getenv("LLAMA_CONNECT_TIMEOUT", "5"))
LLAMA_READ_TIMEOUT = float(os.getenv("LLAMA_READ_TIMEOUT", "120"))
LLAMA_WRITE_TIMEOUT = float(os.getenv("LLAMA_WRITE_TIMEOUT", "10"))
LLAMA_POOL_TIMEOUT = float(os.getenv("LLAMA_POOL_TIMEOUT", "5"))
MAX_INFERENCES_SIMULTANEES = int(
    os.getenv("MAX_INFERENCES_SIMULTANEES", "1")
)
SYSTEM_PROMPT = (
    "Tu es un assistant de cybersécurité éducatif. "
    "Tu dois rester dans un cadre légal, défensif et autorisé. "
    "Refuse les demandes qui facilitent une intrusion, le vol de données "
    "ou le contournement non autorisé. "
    "Quand c'est utile, donne des explications, des exemples défensifs "
    "et indique si l'action est légale, illégale ou neutre."
)

inference_semaphore = asyncio.Semaphore(MAX_INFERENCES_SIMULTANEES)

class MessageLlama(BaseModel):
    role: str
    content: str = Field(min_length=1)

class ChoixLlama(BaseModel):
    message: MessageLlama

class UsageLlama(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0

class ReponseLlama(BaseModel):
    choices: list[ChoixLlama] = Field(min_length=1)
    usage: UsageLlama | None = None


def construire_payload(prompt: Prompt, historique: list[MessageHistorique],) -> dict:
    """
    Construit manuellement le JSON envoyé à llama.cpp.

    On ne transmet pas directement tout l'objet reçu du frontend.
    """

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
    ]

    # Je garde seulement la fin de l'historique pour éviter un prompt trop gros.
    for message in historique[-20:]:
        messages.append(
            {
                "role": message.role,
                "content": message.contenu,
            }
        )

    message_utilisateur = (
        f"Intention de l'utilisateur : {prompt.intention}\n\n"
        f"Message de l'utilisateur : {prompt.contenu}"
    )

    messages.append(
        {
            "role": "user",
            "content": message_utilisateur
        }
    )

    return {
        "model": LLAMA_MODEL,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": prompt.max_tokens,
        "stream": False,
    }


async def appeler_llama(prompt: Prompt, historique: list[MessageHistorique]) -> tuple[str, int]:
    """
    Appelle llama.cpp et retourne :

    1. Le texte généré
    2. Le nombre total de tokens utilisés
    """

    if not LLAMA_API_URL:
        raise HTTPException(
            status_code=500,
            detail="LLAMA_API_URL n'est pas configurée.",
        )

    payload = construire_payload(prompt, historique)

    timeout_http = httpx.Timeout(
        connect=LLAMA_CONNECT_TIMEOUT,
        read=LLAMA_READ_TIMEOUT,
        write=LLAMA_WRITE_TIMEOUT,
        pool=LLAMA_POOL_TIMEOUT,
    )

    try:
        # Le modèle local est lourd, donc je limite les appels en parallèle.
        async with asyncio.timeout(15):
            await inference_semaphore.acquire()

    except TimeoutError as error:
        raise HTTPException(
            status_code=503,
            detail="Le serveur d'intelligence artificielle est occupé.",
        ) from error

    try:
        async with httpx.AsyncClient(timeout=timeout_http) as client:
            response = await client.post(
                LLAMA_API_URL,
                json=payload,
            )

            response.raise_for_status()

    except httpx.TimeoutException as error:
        raise HTTPException(
            status_code=504,
            detail="llama.cpp a dépassé le délai autorisé.",
        ) from error

    except httpx.HTTPStatusError as error:
        raise HTTPException(
            status_code=502,
            detail=(
                "llama.cpp a retourné une erreur HTTP : "
                f"{error.response.status_code}"
            ),
        ) from error

    except httpx.RequestError as error:
        raise HTTPException(
            status_code=502,
            detail="Impossible de communiquer avec llama.cpp.",
        ) from error

    finally:
        # Important: ne pas bloquer les prochains appels si llama.cpp plante.
        inference_semaphore.release()

    try:
        resultat_json = response.json()

    except ValueError as error:
        raise HTTPException(
            status_code=502,
            detail="llama.cpp n'a pas retourné un JSON valide.",
        ) from error

    try:
        resultat = ReponseLlama.model_validate(resultat_json)

    except ValidationError as error:
        raise HTTPException(
            status_code=502,
            detail="La structure de la réponse de llama.cpp est invalide.",
        ) from error

    texte = resultat.choices[0].message.content.strip()

    if not texte:
        raise HTTPException(
            status_code=502,
            detail="llama.cpp a retourné une réponse vide.",
        )

    tokens_utilises = 0

    if resultat.usage is not None:
        tokens_utilises = resultat.usage.total_tokens

    return texte, tokens_utilises
