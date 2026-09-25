import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coding Resources | Free Dev Docs and Tutorials | My Kit Tool",
  description:
    "Find coding docs, tutorials and learning links. Search by topic like JavaScript, React and CSS. Free on My Kit Tool.",
  keywords:
    "coding resources, programming tutorials, javascript docs, react resources, learn to code, developer links, my kit tool",
  alternates: { canonical: "/coding-resources" },
  openGraph: {
    title: "Coding Resources | My Kit Tool",
    description: "Search coding docs and tutorials by topic.",
    url: "https://mykittool.online/coding-resources",
    siteName: "MY KIT TOOL",
    type: "website",
  },
};

export default function CodingResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
