import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Unlock | Remove PDF Password | My Kit Tool",
  description:
    "Unlock a password-protected PDF in your browser. Remove a known PDF password privately. No upload, free.",
  keywords:
    "pdf unlock, remove pdf password, unlock pdf online, decrypt pdf, password protected pdf, my kit tool",
  alternates: { canonical: "/pdf-unlock" },
  openGraph: {
    title: "PDF Unlock | My Kit Tool",
    description:
      "Remove a known PDF password in your browser. Private and free.",
    url: "https://mykittool.vercel.app/pdf-unlock",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function PdfUnlockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
