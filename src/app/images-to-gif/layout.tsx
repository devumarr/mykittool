import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Images to GIF Converter | Free Online GIF Maker",
  description:
    "Create a looping GIF from photos in your browser. Free images to GIF converter. No upload. Download a square chat-ready GIF.",
  keywords: [
    "images to gif",
    "photo to gif",
    "gif maker",
    "convert images to gif",
    "free gif maker",
    "jpg to gif",
    "png to gif",
    "whatsapp gif maker",
    "my kit tool",
  ],
  alternates: {
    canonical: "https://mykittool.online/images-to-gif",
  },
  openGraph: {
    title: "Images to GIF Converter | My Kit Tool",
    description:
      "Turn photos into a looping GIF in your browser. Free, private, no upload.",
    url: "https://mykittool.online/images-to-gif",
    siteName: "My Kit Tool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Images to GIF Converter | My Kit Tool",
    description: "Turn photos into a looping GIF in your browser.",
  },
};

export default function ImagesToGifLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
