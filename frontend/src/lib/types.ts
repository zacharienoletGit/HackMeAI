export type RoleMessage = "user" | "assistant";

export type Message = {
  role: RoleMessage;
  contenu: string;
  date_creation?: string;
};

export type ReponseQuestion = {
  reponse: string;
  conversation_id?: string;
};

export type HistoriqueReponse = {
  conversation_id: string;
  messages: Message[];
};

export type ConversationLocale = {
  id: string;
  titre: string;
  dateModification: string;
};

export type UtilisateurCree = {
  id: string;
  nom: string;
  email: string;
  quota_tokens: number;
  est_actif: boolean;
  date_creation: string;
  api_key: string;
};
