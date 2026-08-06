from datetime import datetime
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
)


class UtilisateurCreation(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    nom: str = Field(
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    quota_tokens: int = Field(
        default=10_000,
        ge=0,
        le=1_000_000,
    )


class UtilisateurCree(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: UUID
    nom: str
    email: str
    quota_tokens: int
    est_actif: bool
    date_creation: datetime

    # Retournée uniquement lors de la création.
    api_key: str


class UtilisateurAuthentifie(BaseModel):
    id: UUID
    nom: str
    email: str
    quota_tokens: int
    est_actif: bool