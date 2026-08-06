import type { Metadata } from "next";
import Link from "next/link";

import { FormulaireConnexion } from "@/components/FormulaireConnexion";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Connexion" };

export default function ConnexionPage() {
  return (
    <main className="authPage">
      <div className="authVisual">
        <Logo />
        <div className="authPitch">
          <span className="eyebrow">FastAPI · Next.js · IA locale</span>
          <h1>Ton intelligence artificielle, dans une interface claire.</h1>
          <p>
            Pose des questions, poursuis tes conversations et consulte ton
            historique sans exposer ta clé API au code client.
          </p>
        </div>
        <div className="visualCode" aria-hidden="true">
          <span>POST</span>
          <code>/questionner</code>
          <b>200</b>
        </div>
      </div>
      <section className="authCard">
        <div>
          <span className="eyebrow">Connexion utilisateur</span>
          <h2>Entre ta clé HackMeAI</h2>
          <p>La clé sera réellement vérifiée par FastAPI au premier appel.</p>
        </div>
        <FormulaireConnexion />
        <Link className="adminLink" href="/admin/connexion">
          Accès administrateur →
        </Link>
      </section>
    </main>
  );
}
