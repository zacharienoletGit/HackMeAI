export type ErreurApi = {
  detail?: string | Array<{ msg?: string }>;
  message?: string;
};

export async function lireJsonSansEchec(response: Response): Promise<unknown> {
  // Des fois l'API retourne du texte au lieu d'un JSON.
  const texte = await response.text();

  if (!texte) {
    return null;
  }

  try {
    return JSON.parse(texte) as unknown;
  } catch {
    return { detail: texte };
  }
}

export function extraireMessageErreur(
  donnees: unknown,
  repli = "Une erreur est survenue.",
): string {
  if (!donnees || typeof donnees !== "object") {
    return repli;
  }

  const erreur = donnees as ErreurApi;

  if (typeof erreur.detail === "string") {
    return erreur.detail;
  }

  if (Array.isArray(erreur.detail)) {
    const messages = erreur.detail
      .map((element) => element.msg)
      .filter((message): message is string => Boolean(message));

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  if (typeof erreur.message === "string") {
    return erreur.message;
  }

  return repli;
}
