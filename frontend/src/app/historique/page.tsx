import type { Metadata } from "next";

import { ListeHistorique } from "@/components/ListeHistorique";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = { title: "Historique" };

export default function HistoriquePage() {
  return (
    <>
      <Navigation />
      <main className="appMain pageContainer">
        <div className="pageHeading">
          <span className="eyebrow">Conversations locales</span>
          <h1>Historique</h1>
          <p>
            Cette liste est conservée dans ce navigateur. Le contenu détaillé
            est toujours récupéré depuis FastAPI.
          </p>
        </div>
        <ListeHistorique />
      </main>
    </>
  );
}
