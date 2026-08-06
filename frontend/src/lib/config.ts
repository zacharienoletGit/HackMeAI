import "server-only";

export function obtenirUrlFastApi(): string {
  const url = process.env.FASTAPI_URL?.trim();

  if (!url) {
    throw new Error(
      "FASTAPI_URL n'est pas configurée. Copie .env.local.example vers .env.local.",
    );
  }

  return url.replace(/\/$/, "");
}
