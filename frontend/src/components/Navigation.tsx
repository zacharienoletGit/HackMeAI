import Link from "next/link";

import { BoutonDeconnexion } from "@/components/BoutonDeconnexion";
import { Logo } from "@/components/Logo";

export function Navigation() {
  return (
    <header className="topbar">
      <div className="topbarInner">
        <Logo />
        <nav className="navigation" aria-label="Navigation principale">
          <Link href="/chat">Chat</Link>
          <Link href="/historique">Historique</Link>
          <Link href="/admin/connexion">Administration</Link>
          <BoutonDeconnexion />
        </nav>
      </div>
    </header>
  );
}
