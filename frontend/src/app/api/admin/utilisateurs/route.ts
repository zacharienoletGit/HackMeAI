import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { COOKIE_ADMIN_KEY } from "@/lib/cookies";
import { obtenirUrlFastApi } from "@/lib/config";
import { lireJsonSansEchec } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const adminKey = cookieStore.get(COOKIE_ADMIN_KEY)?.value;

  if (!adminKey) {
    return NextResponse.json(
      { detail: "La session administrateur a expiré." },
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
    // Je laisse FastAPI valider la clé admin et créer l'utilisateur.
    const response = await fetch(`${obtenirUrlFastApi()}/utilisateurs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ADMINKEY: adminKey,
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });

    const donnees = await lireJsonSansEchec(response);

    if (response.status === 401 || response.status === 403) {
      cookieStore.delete(COOKIE_ADMIN_KEY);
    }

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
