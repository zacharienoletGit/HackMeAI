"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

import { MessageChat } from "@/components/MessageChat";
import { enregistrerConversationLocale } from "@/lib/conversations-locales";
import { extraireMessageErreur } from "@/lib/http";
import type { Message, ReponseQuestion } from "@/lib/types";

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contenu, setContenu] = useState("");
  const [intention, setIntention] = useState("répondre à une question");
  const [maxTokens, setMaxTokens] = useState(500);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [avertissement, setAvertissement] = useState("");
  const finMessages = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finMessages.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chargement]);

  async function envoyer() {
    const question = contenu.trim();

    if (!question || chargement) {
      return;
    }

    setErreur("");
    setAvertissement("");
    setChargement(true);
    setContenu("");
    setMessages((messagesActuels) => [
      ...messagesActuels,
      { role: "user", contenu: question },
    ]);

    try {
      const response = await fetch("/api/questionner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contenu: question,
          intention,
          max_tokens: maxTokens,
          conversation_id: conversationId,
        }),
      });

      const donnees = (await response.json().catch(() => null)) as
        | ReponseQuestion
        | null;

      if (!response.ok || !donnees?.reponse) {
        setErreur(
          extraireMessageErreur(
            donnees,
            "Le backend n’a pas retourné de réponse valide.",
          ),
        );
        return;
      }

      setMessages((messagesActuels) => [
        ...messagesActuels,
        { role: "assistant", contenu: donnees.reponse },
      ]);

      const idRetourne = donnees.conversation_id ?? conversationId;

      // Je garde l'id pour continuer la même conversation après.
      if (idRetourne) {
        setConversationId(idRetourne);
        enregistrerConversationLocale({
          id: idRetourne,
          titre: question.slice(0, 72),
          dateModification: new Date().toISOString(),
        });
      } else {
        setAvertissement(
          "Le backend répond, mais ne retourne pas conversation_id. Applique le petit correctif backend inclus pour activer la continuité et l’historique.",
        );
      }
    } catch {
      setErreur("La requête n’a pas pu être envoyée.");
    } finally {
      setChargement(false);
    }
  }

  function soumettre(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void envoyer();
  }

  function gererClavier(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void envoyer();
    }
  }

  function nouvelleConversation() {
    setMessages([]);
    setConversationId(null);
    setErreur("");
    setAvertissement("");
    setContenu("");
  }

  return (
    <section className="chatShell">
      <aside className="chatSidebar">
        <div>
          <span className="eyebrow">Assistant local</span>
          <h1>HackMeAI</h1>
          <p>Questionne ton modèle à travers ton API FastAPI sécurisée.</p>
        </div>
        <button
          className="button buttonSecondary buttonFull"
          type="button"
          onClick={nouvelleConversation}
        >
          + Nouvelle conversation
        </button>
        <div className="settingsCard">
          <label htmlFor="intention">Intention</label>
          <input
            id="intention"
            value={intention}
            maxLength={100}
            onChange={(event) => setIntention(event.target.value)}
          />
          <label htmlFor="max-tokens">Maximum de tokens</label>
          <input
            id="max-tokens"
            type="number"
            min={1}
            max={500}
            value={maxTokens}
            onChange={(event) =>
              setMaxTokens(
                Math.min(500, Math.max(1, Number(event.target.value) || 1)),
              )
            }
          />
        </div>
        {conversationId ? (
          <div className="conversationBadge">
            <span>Conversation active</span>
            <code>{conversationId}</code>
          </div>
        ) : null}
      </aside>

      <div className="chatMain">
        <div className="messages" aria-live="polite">
          {messages.length === 0 ? (
            <div className="emptyChat">
              <div className="emptyIcon">H</div>
              <h2>Que veux-tu analyser?</h2>
              <p>
                Écris une question, du code ou une erreur. Entrée envoie le
                message; Maj + Entrée ajoute une nouvelle ligne.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageChat key={`${message.role}-${index}`} message={message} />
            ))
          )}
          {chargement ? (
            <div className="typing" role="status">
              <span />
              <span />
              <span />
              HackMeAI réfléchit
            </div>
          ) : null}
          <div ref={finMessages} />
        </div>

        <div className="composerArea">
          {erreur ? <p className="alert alertError">{erreur}</p> : null}
          {avertissement ? (
            <p className="alert alertWarning">{avertissement}</p>
          ) : null}
          <form className="composer" onSubmit={soumettre}>
            <textarea
              aria-label="Message"
              placeholder="Écris ton message…"
              value={contenu}
              maxLength={1_000_000}
              onChange={(event) => setContenu(event.target.value)}
              onKeyDown={gererClavier}
              rows={3}
              disabled={chargement}
            />
            <button
              className="sendButton"
              type="submit"
              disabled={chargement || contenu.trim().length === 0}
              aria-label="Envoyer"
            >
              ↑
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
