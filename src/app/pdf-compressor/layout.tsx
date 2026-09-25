import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Compressor | Compress PDF Online Free | My Kit Tool",
  description:
    "Compress PDF files in your browser. Reduce PDF size without uploading. Free and private on My Kit Tool.",
  keywords:
    "pdf compressor, compress pdf, reduce pdf size, shrink pdf, pdf optimizer, my kit tool",
  alternates: { canonical: "/pdf-compressor" },
  openGraph: {
    title: "PDF Compressor | My Kit Tool",
    description: "Compress PDFs privately in your browser.",
    url: "https://mykittool.online/pdf-compressor",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function PdfCompressorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
