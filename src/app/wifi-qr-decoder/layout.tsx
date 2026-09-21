import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free WiFi QR Decoder | My Kit Tool",
  description:
    "Read a WiFi QR code and see the network name and password. Free WiFi QR decoder in your browser.",
};

export default function WifiQrDecoderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
