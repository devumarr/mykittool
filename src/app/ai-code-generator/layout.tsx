import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Code Generator | My Kit Tool",
  description:
    "Generate code from a simple request. Free AI code generator in your browser on My Kit Tool.",
};

export default function AiCodeGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
