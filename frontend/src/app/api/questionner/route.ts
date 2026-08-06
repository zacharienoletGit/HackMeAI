import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { COOKIE_API_KEY } from "@/lib/cookies";
import { obtenirUrlFastApi } from "@/lib/config";
import { lireJsonSansEchec } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const apiKey = cookieStore.get(COOKIE_API_KEY)?.value;

  // La clé reste côté serveur; le navigateur ne l'envoie pas directement à FastAPI.
  if (!apiKey) {
    return NextResponse.json(
      { detail: "La session a expiré. Reconnecte-toi." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { detail: "Le corps JSON est invalide." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${obtenirUrlFastApi()}/questionner`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        APIKEY: apiKey,
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(180_000),
    });

    const donnees = await lireJsonSansEchec(response);

    return NextResponse.json(donnees, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Le backend est inaccessible.";

    return NextResponse.json(
      { detail: `Impossible de joindre FastAPI : ${message}` },
      { status: 502 },
    );
  }
}
