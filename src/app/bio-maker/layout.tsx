import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Bio Maker | My Kit Tool",
  description:
    "Write a short profile bio for Instagram, TikTok, or LinkedIn. Free bio maker in your browser.",
};

export default function BioMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
