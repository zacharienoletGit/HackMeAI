from contextlib import asynccontextmanager
import os
from pathlib import Path

from dotenv import load_dotenv

# À charger avant les modules qui lisent les variables d'environnement.
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from fastapi import FastAPI

from .database import (
    engine,
    initialiser_base_donnees,
)
from .middleware.body_size import BodySizeLimitMiddleware
from .routers.question import router as question_router
from .routers.user import router as user_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await initialiser_base_donnees()

    yield

    await engine.dispose()


app = FastAPI(
    title="API prompts",
    version="0.0.1",
    lifespan=lifespan,
)

app.add_middleware(
    BodySizeLimitMiddleware,
    max_body_size=int(os.getenv("MAX_BODY_SIZE", "2000000")),
)

app.include_router(question_router)
app.include_router(user_router)


@app.get("/sante")
def verifier_api() -> dict[str, str]:
    return {"status": "ok"}
