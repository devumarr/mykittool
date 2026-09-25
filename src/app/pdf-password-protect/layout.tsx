import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Password Protect | Lock PDF Online | My Kit Tool",
  description:
    "Add a password to a PDF in your browser. Encrypt and lock a PDF privately. No upload, free.",
  keywords:
    "pdf password protect, lock pdf, encrypt pdf, password protect pdf online, secure pdf, my kit tool",
  alternates: { canonical: "/pdf-password-protect" },
  openGraph: {
    title: "PDF Password Protect | My Kit Tool",
    description:
      "Lock a PDF with a password in your browser. Private and free.",
    url: "https://mykittool.vercel.app/pdf-password-protect",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function PdfPasswordProtectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
