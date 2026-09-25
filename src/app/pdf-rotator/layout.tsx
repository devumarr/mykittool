import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Rotator | Rotate PDF Pages Online Free | My Kit Tool",
  description:
    "Rotate PDF pages left or right in your browser. Fix upside-down pages. Free and private on My Kit Tool.",
  keywords:
    "pdf rotator, rotate pdf, rotate pdf pages, flip pdf page, pdf orientation, my kit tool",
  alternates: { canonical: "/pdf-rotator" },
  openGraph: {
    title: "PDF Rotator | My Kit Tool",
    description: "Rotate PDF pages privately in your browser.",
    url: "https://mykittool.online/pdf-rotator",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function PdfRotatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
