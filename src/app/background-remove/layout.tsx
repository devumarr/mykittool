import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Background Remover | Remove Image Background Free | My Kit Tool",
  description:
    "Remove a photo background in your browser and download a transparent PNG. No upload, no account. Free on My Kit Tool.",
  keywords:
    "background remover, remove background, transparent background, cut out image, png background remover, my kit tool",
  alternates: { canonical: "https://mykittool.online/background-remove" },
  openGraph: {
    title: "Background Remover | Remove Image Background Free",
    description:
      "Cut out a subject and download a transparent PNG. The photo stays on your device.",
    url: "https://mykittool.online/background-remove",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function BackgroundRemoveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
