import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { COOKIE_ADMIN_KEY, OPTIONS_COOKIE } from "@/lib/cookies";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { adminKey?: unknown }
    | null;
  const adminKey =
    typeof body?.adminKey === "string" ? body.adminKey.trim() : "";

  if (adminKey.length < 3) {
    return NextResponse.json(
      { detail: "La clé administrateur est requise." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_ADMIN_KEY, adminKey, OPTIONS_COOKIE);

  return NextResponse.json({ connecte: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_ADMIN_KEY);

  return NextResponse.json({ connecte: false });
}
