import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Email Writer | My Kit Tool",
  description:
    "Write a clear email in seconds. Free AI email writer in your browser on My Kit Tool.",
};

export default function AiEmailWriterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
