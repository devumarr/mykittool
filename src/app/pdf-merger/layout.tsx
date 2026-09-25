import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Merger | Merge PDF Files Online Free | My Kit Tool",
  description:
    "Merge multiple PDF files into one. Reorder pages in your browser. Free and private on My Kit Tool.",
  keywords:
    "pdf merger, merge pdf, combine pdf, join pdf files, merge pdf online free, my kit tool",
  alternates: { canonical: "/pdf-merger" },
  openGraph: {
    title: "PDF Merger | My Kit Tool",
    description: "Combine PDFs in your browser. Private and free.",
    url: "https://mykittool.online/pdf-merger",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function PdfMergerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
