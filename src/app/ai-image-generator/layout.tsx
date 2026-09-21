import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Image Generator | My Kit Tool",
  description:
    "Create images from a text prompt in your browser. Free AI image generator on My Kit Tool.",
};

export default function AiImageGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
