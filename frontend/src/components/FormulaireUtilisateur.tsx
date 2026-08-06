"use client";

import { FormEvent, useState } from "react";

import { BoutonDeconnexion } from "@/components/BoutonDeconnexion";
import { extraireMessageErreur } from "@/lib/http";
import type { UtilisateurCree } from "@/lib/types";

export function FormulaireUtilisateur() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [quota, setQuota] = useState(10_000);
  const [utilisateur, setUtilisateur] = useState<UtilisateurCree | null>(null);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [copie, setCopie] = useState(false);

  async function soumettre(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreur("");
    setUtilisateur(null);
    setCopie(false);
    setChargement(true);

    try {
      const response = await fetch("/api/admin/utilisateurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          email,
          quota_tokens: quota,
        }),
      });
      const donnees = (await response.json().catch(() => null)) as
        | UtilisateurCree
        | null;

      if (!response.ok || !donnees?.api_key) {
        setErreur(extraireMessageErreur(donnees));
        return;
      }

      setUtilisateur(donnees);
      setNom("");
      setEmail("");
      setQuota(10_000);
    } catch {
      setErreur("Impossible de créer l’utilisateur.");
    } finally {
      setChargement(false);
    }
  }

  async function copierCle() {
    if (!utilisateur) {
      return;
    }

    await navigator.clipboard.writeText(utilisateur.api_key);
    setCopie(true);
  }

  return (
    <div className="adminGrid">
      <section className="panel">
        <div className="panelHeader">
          <div>
            <span className="eyebrow">Administration</span>
            <h1>Créer un utilisateur</h1>
          </div>
          <BoutonDeconnexion admin />
        </div>

        <form className="stackedForm" onSubmit={soumettre}>
          <label htmlFor="nom">Nom</label>
          <input
            id="nom"
            minLength={2}
            maxLength={100}
            value={nom}
            onChange={(event) => setNom(event.target.value)}
            required
          />

          <label htmlFor="email">Courriel</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="quota">Quota de tokens</label>
          <input
            id="quota"
            type="number"
            min={0}
            max={1_000_000}
            value={quota}
            onChange={(event) => setQuota(Number(event.target.value) || 0)}
            required
          />

          {erreur ? <p className="alert alertError">{erreur}</p> : null}

          <button className="button buttonPrimary" disabled={chargement}>
            {chargement ? "Création…" : "Créer et générer la clé"}
          </button>
        </form>
      </section>

      <section className="panel resultPanel">
        {utilisateur ? (
          <>
            <span className="successMark">✓</span>
            <span className="eyebrow">Utilisateur créé</span>
            <h2>{utilisateur.nom}</h2>
            <p>{utilisateur.email}</p>
            <div className="apiKeyBox">
              <code>{utilisateur.api_key}</code>
              <button
                className="button buttonSecondary"
                type="button"
                onClick={copierCle}
              >
                {copie ? "Copiée" : "Copier"}
              </button>
            </div>
            <p className="alert alertWarning">
              Cette clé complète est affichée une seule fois. Copie-la avant de
              quitter cette page.
            </p>
          </>
        ) : (
          <div className="resultPlaceholder">
            <span className="resultIcon">↗</span>
            <h2>La clé apparaîtra ici</h2>
            <p>
              FastAPI crée l’utilisateur et conserve uniquement le hash de sa
              clé.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
