import type { Metadata } from "next";
import Link from "next/link";

import { FormulaireConnexionAdmin } from "@/components/FormulaireConnexionAdmin";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Administration" };

export default function ConnexionAdminPage() {
  return (
    <main className="authPage adminAuthPage">
      <div className="authVisual adminVisual">
        <Logo />
        <div className="authPitch">
          <span className="eyebrow">Zone protégée</span>
          <h1>Administration des accès HackMeAI.</h1>
          <p>
            Crée un utilisateur, définis son quota et remets-lui sa clé API
            générée une seule fois.
          </p>
        </div>
      </div>
      <section className="authCard">
        <div>
          <span className="eyebrow">Administrateur</span>
          <h2>Clé ADMIN_API_KEY</h2>
          <p>Elle sera transmise à FastAPI dans le header ADMINKEY.</p>
        </div>
        <FormulaireConnexionAdmin />
        <Link className="adminLink" href="/connexion">
          ← Connexion utilisateur
        </Link>
      </section>
    </main>
  );
}
