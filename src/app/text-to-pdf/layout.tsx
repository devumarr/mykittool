import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text to PDF | Convert Text to PDF Online | My Kit Tool",
  description:
    "Convert text or a .txt file to PDF in your browser. Free, private, no upload.",
  keywords:
    "text to pdf, convert text to pdf, txt to pdf, notes to pdf, my kit tool",
  alternates: { canonical: "/text-to-pdf" },
  openGraph: {
    title: "Text to PDF | My Kit Tool",
    description: "Turn text into a PDF in your browser. Private and free.",
    url: "https://mykittool.vercel.app/text-to-pdf",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function TextToPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
