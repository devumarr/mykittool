import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Free Tools | My Kit Tool",
  description:
    "Browse every free tool on My Kit Tool. PDF, image, AI, audio and more. Open a tool in your browser with no signup.",
};

export default function AllToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
