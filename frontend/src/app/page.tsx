import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { COOKIE_API_KEY } from "@/lib/cookies";

export default async function Accueil() {
  const cookieStore = await cookies();
  redirect(cookieStore.has(COOKIE_API_KEY) ? "/chat" : "/connexion");
}
