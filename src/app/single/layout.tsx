import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free QR Code Generator | Custom Logo QR | My Kit Tool",
  description:
    "Create a branded QR code online for free. Add a logo, colors, and background, then download PNG, JPG, PDF, or SVG. No signup.",
  keywords: [
    "free qr code generator",
    "custom qr code",
    "qr code with logo",
    "branded qr code",
    "download qr png",
    "my kit tool qr",
  ],
  alternates: { canonical: "/single" },
  openGraph: {
    title: "Free QR Code Generator | My Kit Tool",
    description:
      "Design a branded QR code with logo and colors. Download PNG, JPG, PDF or SVG.",
    url: "/single",
    type: "website",
  },
};

const faq = [
  {
    q: "Is this QR code generator free?",
    a: "Yes. You can create and download QR codes on My Kit Tool with no signup.",
  },
  {
    q: "Can I add my logo to the QR code?",
    a: "Yes. Upload a logo, set the size, and keep high error correction so phones can still scan it.",
  },
  {
    q: "Which download formats are supported?",
    a: "PNG, JPG, PDF, and SVG.",
  },
  {
    q: "Does the QR code work after I download it?",
    a: "Yes. The file is a normal QR image. Print it or share it. Test with your phone camera first.",
  },
  {
    q: "Is my data stored on your server?",
    a: "The QR is built in your browser. We do not store the link or file you type into this tool.",
  },
];

export default function SingleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
