import type { Metadata } from "next";

import { Chat } from "@/components/Chat";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = { title: "Chat" };

export default function ChatPage() {
  return (
    <>
      <Navigation />
      <main className="appMain appMainChat">
        <Chat />
      </main>
    </>
  );
}
