import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to File | Convert PNG JPG WebP PDF Free | My Kit Tool",
  description:
    "Convert images to PNG, JPG, WebP or PDF in your browser. Free and private on My Kit Tool.",
  keywords:
    "image converter, png to jpg, jpg to png, image to webp, image to pdf, convert image format, my kit tool",
  alternates: { canonical: "/image-to-file" },
  openGraph: {
    title: "Image to File | My Kit Tool",
    description: "Convert image formats privately in your browser.",
    url: "https://mykittool.online/image-to-file",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function ImageToFileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
