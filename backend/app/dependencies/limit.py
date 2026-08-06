from collections import defaultdict, deque
from datetime import date
import os
from time import monotonic

from fastapi import HTTPException

REQUETES_PAR_MINUTE = int(os.getenv("REQUETES_PAR_MINUTE", "5"))
FENETRE_SECONDES = 60

# Ces compteurs sont en mémoire, donc ils repartent à zéro au redémarrage.
historique: dict[str, deque[float]] = defaultdict(deque)


QUOTA_TOKENS_PAR_JOUR = int(os.getenv("QUOTA_TOKENS_PAR_JOUR", "10000"))

tokens_par_utilisateur: dict[str, int] = defaultdict(int)
date_quota: dict[str, date] = {}

async def verifier_rate_limit(utilisateur_id: str) -> None:
    maintenant = monotonic()
    limite = maintenant - FENETRE_SECONDES

    requetes = historique[utilisateur_id]

    while requetes and requetes[0] < limite:
        requetes.popleft()

    if len(requetes) >= REQUETES_PAR_MINUTE:
        raise HTTPException(
            status_code=429,
            detail="Trop de requêtes. Réessayez plus tard.",
            headers={"Retry-After": "60"},
        )

    requetes.append(maintenant)

def reinitialiser_quota_si_necessaire(
    utilisateur_id: str,
) -> None:
    aujourd_hui = date.today()

    if date_quota.get(utilisateur_id) != aujourd_hui:
        date_quota[utilisateur_id] = aujourd_hui
        tokens_par_utilisateur[utilisateur_id] = 0


async def verifier_quota(
    utilisateur_id: str,
    tokens_demandes: int,
    quota_tokens: int = QUOTA_TOKENS_PAR_JOUR,
) -> None:
    reinitialiser_quota_si_necessaire(utilisateur_id)

    tokens_deja_utilises = tokens_par_utilisateur[utilisateur_id]

    total_possible = tokens_deja_utilises + tokens_demandes

    if total_possible > quota_tokens:
        raise HTTPException(
            status_code=429,
            detail=(
                "Quota quotidien de tokens dépassé. "
                f"Tokens utilisés : {tokens_deja_utilises}. "
                f"Quota maximum : {quota_tokens}."
            ),
        )


async def enregistrer_tokens(
    utilisateur_id: str,
    tokens_utilises: int,
) -> None:
    reinitialiser_quota_si_necessaire(utilisateur_id)

    if tokens_utilises < 0:
        tokens_utilises = 0

    tokens_par_utilisateur[utilisateur_id] += tokens_utilises
