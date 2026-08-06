import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { COOKIE_API_KEY, OPTIONS_COOKIE } from "@/lib/cookies";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { apiKey?: unknown }
    | null;
  const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";

  if (!apiKey.startsWith("hmai_") || apiKey.length < 20) {
    return NextResponse.json(
      { detail: "La clé API doit commencer par hmai_." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_API_KEY, apiKey, OPTIONS_COOKIE);

  return NextResponse.json({ connecte: true });
}

export async function GET() {
  const cookieStore = await cookies();

  return NextResponse.json({
    connecte: cookieStore.has(COOKIE_API_KEY),
  });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_API_KEY);

  return NextResponse.json({ connecte: false });
}
