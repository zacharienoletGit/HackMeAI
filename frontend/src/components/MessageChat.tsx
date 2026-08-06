import type { Message } from "@/lib/types";

export function MessageChat({ message }: { message: Message }) {
  const estUtilisateur = message.role === "user";

  return (
    <article
      className={`chatMessage ${
        estUtilisateur ? "chatMessageUser" : "chatMessageAssistant"
      }`}
    >
      <div className="messageAvatar" aria-hidden="true">
        {estUtilisateur ? "V" : "H"}
      </div>
      <div className="messageBody">
        <strong>{estUtilisateur ? "Vous" : "HackMeAI"}</strong>
        <div className="messageContent">{message.contenu}</div>
        {message.date_creation ? (
          <time dateTime={message.date_creation}>
            {new Intl.DateTimeFormat("fr-CA", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(message.date_creation))}
          </time>
        ) : null}
      </div>
    </article>
  );
}
