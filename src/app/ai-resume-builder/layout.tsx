import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Resume Builder | My Kit Tool",
  description:
    "Create a clean professional resume in your browser. Free AI resume builder on My Kit Tool.",
};

export default function AiResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
