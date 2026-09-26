import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favicon Generator | PNG ICO and PWA Icons | My Kit Tool",
  description:
    "Create favicon PNG, ICO and PWA icons from one image. Download a ZIP with HTML and Next.js snippets. Free in your browser on My Kit Tool.",
  keywords:
    "favicon generator, favicon ico, apple touch icon, pwa icons, android chrome icon, site webmanifest, my kit tool",
  alternates: { canonical: "/favicon-generator" },
  openGraph: {
    title: "Favicon Generator | My Kit Tool",
    description: "Make favicon and PWA icons from one logo.",
    url: "https://mykittool.online/favicon-generator",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function FaviconGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
