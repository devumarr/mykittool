import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to PDF | Convert JPG PNG to PDF Free | My Kit Tool",
  description:
    "Convert images to PDF in your browser. Combine JPG and PNG into one file. Free and private on My Kit Tool.",
  keywords:
    "image to pdf, jpg to pdf, png to pdf, convert photos to pdf, images to pdf online, my kit tool",
  alternates: { canonical: "/image-to-pdf" },
  openGraph: {
    title: "Image to PDF | My Kit Tool",
    description: "Turn images into a PDF privately in your browser.",
    url: "https://mykittool.online/image-to-pdf",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function ImageToPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
