import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code Preview | HTML CSS JS Live Preview | My Kit Tool",
  description:
    "Preview HTML, CSS and JavaScript in your browser. Upload files or a ZIP, edit code and see a live preview. Free on My Kit Tool.",
  keywords:
    "html preview, css preview, javascript preview, live code preview, zip html preview, code playground, my kit tool",
  alternates: { canonical: "/code-preview" },
  openGraph: {
    title: "Code Preview | My Kit Tool",
    description: "Live HTML CSS JS preview in the browser.",
    url: "https://mykittool.online/code-preview",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function CodePreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
