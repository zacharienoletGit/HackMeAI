"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  lireConversationsLocales,
  supprimerConversationLocale,
} from "@/lib/conversations-locales";
import type { ConversationLocale } from "@/lib/types";

export function ListeHistorique() {
  const [conversations, setConversations] = useState<ConversationLocale[]>([]);

  useEffect(() => {
    setConversations(lireConversationsLocales());
  }, []);

  function supprimer(id: string) {
    supprimerConversationLocale(id);
    setConversations((actuelles) =>
      actuelles.filter((conversation) => conversation.id !== id),
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="emptyPanel">
        <h2>Aucune conversation locale</h2>
        <p>
          Les conversations apparaîtront ici après ton premier échange, à
          condition que FastAPI retourne leur identifiant.
        </p>
        <Link className="button buttonPrimary" href="/chat">
          Commencer une conversation
        </Link>
      </div>
    );
  }

  return (
    <div className="historyGrid">
      {conversations.map((conversation) => (
        <article className="historyCard" key={conversation.id}>
          <Link href={`/historique/${conversation.id}`}>
            <span className="eyebrow">Conversation</span>
            <h2>{conversation.titre}</h2>
            <p>
              {new Intl.DateTimeFormat("fr-CA", {
                dateStyle: "long",
                timeStyle: "short",
              }).format(new Date(conversation.dateModification))}
            </p>
            <code>{conversation.id}</code>
          </Link>
          <button
            className="textButton dangerText"
            type="button"
            onClick={() => supprimer(conversation.id)}
          >
            Retirer de cette liste
          </button>
        </article>
      ))}
    </div>
  );
}
