import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My Kit Tool",
    short_name: "MY KIT TOOL",
    description:
      "Free online tools including AI chatbot, resume builder, image tools and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#060907",
    theme_color: "#3b82f6",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["productivity", "utilities", "business"],
    screenshots: [
      {
        src: "https://i.ibb.co/4gdpcL5d/resized-1000079051.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "Home — search PDF, image and AI tools",
      },
      {
        src: "https://i.ibb.co/QFcLzPN8/resized-1000079055.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "130+ free tools that work in your browser",
      },
      {
        src: "https://i.ibb.co/93sR6kkj/resized-1000079059.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "How it works — choose, use, save",
      },
      {
        src: "https://i.ibb.co/zV2QQgKq/resized-1000079062.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "About the builder — free browser tools",
      },
    ],
  };
}
