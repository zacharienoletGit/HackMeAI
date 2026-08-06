import type { Metadata } from "next";

import { DetailHistorique } from "@/components/DetailHistorique";
import { Navigation } from "@/components/Navigation";

type Props = {
  params: Promise<{ conversationId: string }>;
};

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params;

  return (
    <>
      <Navigation />
      <main className="appMain pageContainer">
        <div className="pageHeading compactHeading">
          <span className="eyebrow">Historique</span>
          <h1>Conversation</h1>
        </div>
        <DetailHistorique conversationId={conversationId} />
      </main>
    </>
  );
}
