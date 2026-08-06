import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { COOKIE_API_KEY } from "@/lib/cookies";
import { obtenirUrlFastApi } from "@/lib/config";
import { lireJsonSansEchec } from "@/lib/http";

export const runtime = "nodejs";

type Contexte = {
  params: Promise<{ conversationId: string }>;
};

export async function GET(_request: Request, contexte: Contexte) {
  const cookieStore = await cookies();
  const apiKey = cookieStore.get(COOKIE_API_KEY)?.value;

  if (!apiKey) {
    return NextResponse.json(
      { detail: "La session a expiré. Reconnecte-toi." },
      { status: 401 },
    );
  }

  const { conversationId } = await contexte.params;

  if (!/^[0-9a-fA-F-]{32,36}$/.test(conversationId)) {
    return NextResponse.json(
      { detail: "Identifiant de conversation invalide." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${obtenirUrlFastApi()}/questionner/historique/${encodeURIComponent(conversationId)}`,
      {
        headers: { APIKEY: apiKey },
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      },
    );

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
