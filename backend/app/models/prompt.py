from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


class Prompt(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    contenu: str = Field(
        min_length=1,
        max_length=1_000_000,
    )

    intention: str = Field(
        min_length=1,
        max_length=100,
    )

    max_tokens: int = Field(
        default=500,
        ge=1,
        le=500,
    )

    conversation_id: UUID | None = None


class Reponse(BaseModel):
    reponse: str = Field(
        min_length=1,
        max_length=20_000_000,
    )

    # Nécessaire au frontend pour continuer et rouvrir la conversation.
    conversation_id: UUID


class MessageHistorique(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    role: Literal["user", "assistant"]
    contenu: str
    date_creation: datetime


class HistoriqueReponse(BaseModel):
    conversation_id: UUID
    messages: list[MessageHistorique]
