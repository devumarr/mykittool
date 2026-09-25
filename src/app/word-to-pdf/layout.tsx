import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word to PDF | Convert DOCX to PDF Online | My Kit Tool",
  description:
    "Convert a Word .docx file to PDF in your browser. Free, private, no upload.",
  keywords:
    "word to pdf, docx to pdf, convert word to pdf, word document to pdf, my kit tool",
  alternates: { canonical: "/word-to-pdf" },
  openGraph: {
    title: "Word to PDF | My Kit Tool",
    description:
      "Turn a .docx file into a PDF in your browser. Private and free.",
    url: "https://mykittool.online/word-to-pdf",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function WordToPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
