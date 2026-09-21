import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Speech to Text | My Kit Tool",
  description:
    "Convert your voice into text in the browser. Free speech to text on My Kit Tool. No signup.",
};

export default function SpeechToTextLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
