import type { Metadata } from "next";

import { FormulaireUtilisateur } from "@/components/FormulaireUtilisateur";

export const metadata: Metadata = { title: "Créer un utilisateur" };

export default function UtilisateursAdminPage() {
  return (
    <main className="adminPage">
      <FormulaireUtilisateur />
    </main>
  );
}
