"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { extraireMessageErreur } from "@/lib/http";

export function FormulaireConnexionAdmin() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function soumettre(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey }),
      });
      const donnees = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        setErreur(extraireMessageErreur(donnees));
        return;
      }

      router.replace("/admin/utilisateurs");
      router.refresh();
    } catch {
      setErreur("Impossible de créer la session administrateur.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <form className="authForm" onSubmit={soumettre}>
      <label htmlFor="admin-key">Clé administrateur</label>
      <input
        id="admin-key"
        type="password"
        autoComplete="off"
        value={adminKey}
        onChange={(event) => setAdminKey(event.target.value)}
        required
      />
      {erreur ? <p className="alert alertError">{erreur}</p> : null}
      <button className="button buttonPrimary buttonFull" disabled={chargement}>
        {chargement ? "Connexion…" : "Accéder à l’administration"}
      </button>
    </form>
  );
}
