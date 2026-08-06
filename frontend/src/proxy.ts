import { NextRequest, NextResponse } from "next/server";

import { COOKIE_ADMIN_KEY, COOKIE_API_KEY } from "@/lib/cookies";

export function proxy(request: NextRequest) {
  const chemin = request.nextUrl.pathname;

  // Je bloque les pages privées si le cookie utilisateur n'est pas là.
  if (
    (chemin.startsWith("/chat") || chemin.startsWith("/historique")) &&
    !request.cookies.has(COOKIE_API_KEY)
  ) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }

  // Même principe pour l'admin, mais avec son propre cookie.
  if (
    chemin.startsWith("/admin/utilisateurs") &&
    !request.cookies.has(COOKIE_ADMIN_KEY)
  ) {
    return NextResponse.redirect(new URL("/admin/connexion", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/historique/:path*", "/admin/utilisateurs/:path*"],
};
