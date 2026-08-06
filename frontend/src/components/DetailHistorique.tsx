"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MessageChat } from "@/components/MessageChat";
import { extraireMessageErreur } from "@/lib/http";
import type { HistoriqueReponse } from "@/lib/types";

export function DetailHistorique({ conversationId }: { conversationId: string }) {
  const [historique, setHistorique] = useState<HistoriqueReponse | null>(null);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let actif = true;

    async function charger() {
      try {
        const response = await fetch(
          `/api/historique/${encodeURIComponent(conversationId)}`,
          { cache: "no-store" },
        );
        const donnees = (await response.json().catch(() => null)) as
          | HistoriqueReponse
          | null;

        if (!actif) {
          return;
        }

        if (!response.ok || !donnees) {
          setErreur(extraireMessageErreur(donnees));
          return;
        }

        setHistorique(donnees);
      } catch {
        if (actif) {
          setErreur("Impossible de charger cette conversation.");
        }
      } finally {
        if (actif) {
          setChargement(false);
        }
      }
    }

    void charger();

    return () => {
      actif = false;
    };
  }, [conversationId]);

  if (chargement) {
    return <div className="loadingPanel">Chargement de la conversation…</div>;
  }

  if (erreur) {
    return (
      <div className="emptyPanel">
        <p className="alert alertError">{erreur}</p>
        <Link className="button buttonSecondary" href="/historique">
          Retour à l’historique
        </Link>
      </div>
    );
  }

  return (
    <div className="historyDetail">
      <div className="historyDetailHeader">
        <div>
          <span className="eyebrow">Identifiant</span>
          <code>{conversationId}</code>
        </div>
        <Link className="button buttonSecondary" href="/chat">
          Nouvelle conversation
        </Link>
      </div>
      <div className="messages historyMessages">
        {historique?.messages.map((message, index) => (
          <MessageChat key={`${message.role}-${index}`} message={message} />
        ))}
      </div>
    </div>
  );
}
