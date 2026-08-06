from collections.abc import Awaitable, Callable
from typing import Any

from starlette.responses import JSONResponse
from starlette.types import Message, Receive, Scope, Send


class BodySizeLimitMiddleware:
    def __init__(
        self,
        app: Callable[..., Awaitable[Any]],
        max_body_size: int,
    ) -> None:
        self.app = app
        self.max_body_size = max_body_size

    async def __call__(
        self,
        scope: Scope,
        receive: Receive,
        send: Send,
    ) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # Si Content-Length est présent, on peut bloquer sans lire tout le corps.
        headers = dict(scope.get("headers", []))
        content_length = headers.get(b"content-length")

        if content_length is not None:
            try:
                taille_annoncee = int(content_length)

                if taille_annoncee > self.max_body_size:
                    await self.retourner_erreur(scope, receive, send)
                    return

            except ValueError:
                pass

        morceaux: list[bytes] = []
        taille_totale = 0

        while True:
            message = await receive()

            if message["type"] == "http.disconnect":
                return

            morceau = message.get("body", b"")
            taille_totale += len(morceau)

            if taille_totale > self.max_body_size:
                await self.retourner_erreur(scope, receive, send)
                return

            morceaux.append(morceau)

            if not message.get("more_body", False):
                break

        corps_complet = b"".join(morceaux)
        corps_transmis = False

        # Le corps a déjà été lu, donc on le redonne à l'application.
        async def recevoir_corps() -> Message:
            nonlocal corps_transmis

            if not corps_transmis:
                corps_transmis = True

                return {
                    "type": "http.request",
                    "body": corps_complet,
                    "more_body": False,
                }

            return {
                "type": "http.disconnect",
            }

        await self.app(scope, recevoir_corps, send)

    @staticmethod
    async def retourner_erreur(
        scope: Scope,
        receive: Receive,
        send: Send,
    ) -> None:
        reponse = JSONResponse(
            status_code=413,
            content={
                "detail": (
                    "Le corps JSON dépasse la taille maximale autorisée."
                )
            },
        )

        await reponse(scope, receive, send)
