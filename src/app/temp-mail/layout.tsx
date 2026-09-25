import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Temp Mail | Disposable Email | My Kit Tool",
  description:
    "Free temporary email address. Create a disposable inbox, receive emails instantly, and stay private. No signup.",
  keywords:
    "temp mail, temporary email, disposable email, fake email, inbox, guerrilla mail, my kit tool",
  alternates: { canonical: "/temp-mail" },
  openGraph: {
    title: "Temp Mail | My Kit Tool",
    description:
      "Free disposable email. Receive mail without using your real inbox.",
    url: "https://mykittool.vercel.app/temp-mail",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function TempMailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
