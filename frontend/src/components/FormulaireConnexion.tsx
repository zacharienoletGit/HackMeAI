"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { extraireMessageErreur } from "@/lib/http";

export function FormulaireConnexion() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function soumettre(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const donnees = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        setErreur(extraireMessageErreur(donnees));
        return;
      }

      router.replace("/chat");
      router.refresh();
    } catch {
      setErreur("Impossible de créer la session.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <form className="authForm" onSubmit={soumettre}>
      <label htmlFor="api-key">Clé API</label>
      <input
        id="api-key"
        name="api-key"
        type="password"
        autoComplete="off"
        placeholder="hmai_…"
        value={apiKey}
        onChange={(event) => setApiKey(event.target.value)}
        required
      />
      <p className="fieldHint">
        Elle est conservée dans un cookie HttpOnly et n’est pas accessible au
        JavaScript de la page.
      </p>
      {erreur ? <p className="alert alertError">{erreur}</p> : null}
      <button className="button buttonPrimary buttonFull" disabled={chargement}>
        {chargement ? "Connexion…" : "Ouvrir HackMeAI"}
      </button>
    </form>
  );
}
