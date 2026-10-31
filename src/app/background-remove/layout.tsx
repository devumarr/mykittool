import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "AI Background Remover - Free Online Tool | Remove Background Instantly",
  description:
    "Remove background from any image in seconds with our free AI background remover. Get clean transparent PNG results. No signup, privacy safe, works on mobile and desktop.",
  keywords: [
    "AI background remover",
    "remove background from image",
    "free background remover",
    "transparent background",
    "remove bg online",
    "background eraser",
    "product photo background remover",
  ],
  openGraph: {
    title: "AI Background Remover - Free Online Tool",
    description:
      "Remove backgrounds instantly with AI. Clean edges, transparent PNG, 100% free and private.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Background Remover",
    description: "Free AI tool to remove background from images instantly.",
  },
  alternates: {
    canonical: "https://mykittool.online/background-remove",
  },
};

export default function BackgroundRemoveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
