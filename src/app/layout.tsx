import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/mykittool/navbar";
import { ToolNav } from "@/components/mykittool/tool-nav";
import { RelatedTools } from "@/components/mykittool/related-tools";
import { Footer } from "@/components/mykittool/footer";
import { Toaster } from "@/components/ui/toaster";
import { FeedbackRow } from "@/components/mykittool/feedback-row";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { Suspense } from "react";
import { KitRouter } from "@/components/mykittool/kit-router";
import { UsageTracker } from "@/components/mykittool/usage-tracker";
import { ThemeProvider } from "@/components/mykittool/theme-provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#3b82f6",
};

export const metadata: Metadata = {
  title: "My Kit Tool | Free Online Tools",
  description:
    "Free online tools for chat, resume, images, logos, code, email and more. Use My Kit Tool in your browser.",
  applicationName: "My Kit Tool",
  keywords:
    "free online tools, ai tools, pdf editor, image converter, qr code generator, developer tools, my kit tool, privacy-focused tools, browser-based utilities",
  authors: [{ name: "My Kit Tool" }],
  creator: "My Kit Tool",
  publisher: "My Kit Tool",
  metadataBase: new URL("https://mykittool.vercel.app"),
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "vMj1XN9ziXyU5kBso8wdA_OhZuzhD0o_BGSrSu9uiGU",
  },

  openGraph: {
    title: "My Kit Tool | Free Online Tools",
    description:
      "Free online tools for chat, resume, images, logos, code, email and more.",
    type: "website",
    locale: "en_US",
    url: "https://mykittool.vercel.app",
    siteName: "My Kit Tool",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "My Kit Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Kit Tool | Free Online Tools",
    description:
      "Free online tools for chat, resume, images, logos, code, email and more.",
    images: ["/twitter-image.png"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-body bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground overflow-x-hidden w-full max-w-full"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "My Kit Tool",
              alternateName: ["MyKitTool", "mykittool"],
              url: "https://mykittool.vercel.app",
              publisher: {
                "@type": "Organization",
                name: "My Kit Tool",
                url: "https://mykittool.vercel.app",
              },
            }),
          }}
        />
        <ThemeProvider>
          <FirebaseClientProvider>
            <UsageTracker />
            <Navbar />
            <main className="min-h-screen pt-16 flex flex-col w-full max-w-full">
              <Suspense fallback={null}>
                <ToolNav />
              </Suspense>
              <div className="flex-1 w-full max-w-full">
                <Suspense fallback={null}>
                  <KitRouter>{children}</KitRouter>
                </Suspense>
                <Suspense fallback={null}>
                  <RelatedTools />
                </Suspense>
              </div>
              <FeedbackRow />
            </main>
            <Footer />
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
