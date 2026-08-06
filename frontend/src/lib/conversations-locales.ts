import type { ConversationLocale } from "@/lib/types";

const CLE_STOCKAGE = "hmai_conversations";

// C'est juste une liste locale pour retrouver les conversations vite.
function estConversationLocale(value: unknown): value is ConversationLocale {
  if (!value || typeof value !== "object") {
    return false;
  }

  const conversation = value as Partial<ConversationLocale>;

  return (
    typeof conversation.id === "string" &&
    typeof conversation.titre === "string" &&
    typeof conversation.dateModification === "string"
  );
}

export function lireConversationsLocales(): ConversationLocale[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const valeur = window.localStorage.getItem(CLE_STOCKAGE);
    const donnees = valeur ? (JSON.parse(valeur) as unknown) : [];

    if (!Array.isArray(donnees)) {
      return [];
    }

    return donnees
      .filter(estConversationLocale)
      .sort(
        (a, b) =>
          new Date(b.dateModification).getTime() -
          new Date(a.dateModification).getTime(),
      );
  } catch {
    return [];
  }
}

export function enregistrerConversationLocale(
  conversation: ConversationLocale,
): void {
  const conversations = lireConversationsLocales();
  const sansConversationCourante = conversations.filter(
    (element) => element.id !== conversation.id,
  );

  window.localStorage.setItem(
    CLE_STOCKAGE,
    JSON.stringify([conversation, ...sansConversationCourante].slice(0, 100)),
  );
}

export function supprimerConversationLocale(id: string): void {
  const conversations = lireConversationsLocales().filter(
    (conversation) => conversation.id !== id,
  );

  window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(conversations));
}
