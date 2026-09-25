import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Image | Convert PDF Pages to JPG PNG | My Kit Tool",
  description:
    "Convert PDF pages to JPG or PNG in your browser. Free, private, no upload.",
  keywords:
    "pdf to image, pdf to jpg, pdf to png, convert pdf pages to image, my kit tool",
  alternates: { canonical: "/pdf-to-image" },
  openGraph: {
    title: "PDF to Image | My Kit Tool",
    description:
      "Turn PDF pages into images in your browser. Private and free.",
    url: "https://mykittool.online/pdf-to-image",

    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function PdfToImageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
