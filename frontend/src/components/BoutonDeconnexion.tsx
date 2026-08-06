"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BoutonDeconnexion({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);

  async function deconnecter() {
    setChargement(true);

    try {
      await fetch(admin ? "/api/admin/session" : "/api/session", {
        method: "DELETE",
      });
    } finally {
      router.replace(admin ? "/admin/connexion" : "/connexion");
      router.refresh();
    }
  }

  return (
    <button
      className="button buttonGhost buttonSmall"
      type="button"
      onClick={deconnecter}
      disabled={chargement}
    >
      {chargement ? "Déconnexion…" : "Déconnexion"}
    </button>
  );
}
