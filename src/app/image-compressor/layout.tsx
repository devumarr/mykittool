import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compressor | Compress JPG PNG Online Free | My Kit Tool",
  description:
    "Compress JPG, PNG, and WebP in your browser. Reduce image size without uploading. Free and private on My Kit Tool.",
  keywords:
    "image compressor, compress image, reduce jpg size, png compressor, shrink photo, my kit tool",
  alternates: { canonical: "https://mykittool.online/image-compressor" },
  openGraph: {
    title: "Image Compressor | My Kit Tool",
    description: "Compress images privately in your browser.",
    url: "https://mykittool.online/image-compressor",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function ImageCompressorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
