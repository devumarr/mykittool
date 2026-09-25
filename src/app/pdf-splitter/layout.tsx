import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Splitter | Split PDF Pages Online Free | My Kit Tool",
  description:
    "Split a PDF into separate pages or custom ranges. Download a ZIP of PDFs in your browser. Free and private.",
  keywords:
    "pdf splitter, split pdf, split pdf pages, pdf to multiple pdf, extract pdf pages, my kit tool",
  alternates: { canonical: "/pdf-splitter" },
  openGraph: {
    title: "PDF Splitter | My Kit Tool",
    description: "Split a PDF into separate files. Private, in your browser.",
    url: "https://mykittool.online/pdf-splitter",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function PdfSplitterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
