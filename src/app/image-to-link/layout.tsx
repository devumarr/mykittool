import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to Link | Free Image Hosting URL | My Kit Tool",
  description:
    "Upload an image and get a public URL. Copy direct, HTML, Markdown and BBCode links. Free image to link tool on My Kit Tool.",
  keywords:
    "image to link, image to url, image hosting, imgbb upload, image url generator, markdown image, my kit tool",
  alternates: { canonical: "/image-to-link" },
  openGraph: {
    title: "Image to Link | My Kit Tool",
    description: "Turn an image into a shareable URL.",
    url: "https://mykittool.online/image-to-link",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function ImageToLinkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
