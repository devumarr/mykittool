import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Chatbot | My Kit Tool",
  description:
    "Chat with a free AI assistant in your browser. Ask a question and get a clear answer on My Kit Tool.",
};

export default function AiChatbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
