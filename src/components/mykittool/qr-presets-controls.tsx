"use client";

import React from "react";
import { QRState } from "@/lib/qr-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  RotateCcw,
  ImageIcon,
  MessageSquare,
  Youtube,
  Search,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TEMPLATES = [
  {
    id: "image-qr",
    label: "Modern Brand",
    type: "URL",
    data: "https://brand.studio",
    color: "#3b82f6",
    dotStyle: "extra-rounded",
  },
  {
    id: "whatsapp",
    label: "Connect Hub",
    type: "WhatsApp",
    whatsapp: { phone: "+1234567890", message: "Hi! Let's collaborate." },
    color: "#3b82f6",
  },
  {
    id: "youtube",
    label: "Media Stream",
    type: "URL",
    data: "https://youtube.com/@brand",
    color: "#3b82f6",
  },
  {
    id: "google-review",
    label: "Trust Pulse",
    type: "URL",
    data: "https://g.page/review/brand",
    color: "#3b82f6",
  },
];

interface QrPresetsControlsProps {
  state: QRState;
  updateState: (updates: Partial<QRState>) => void;
}

export function QrPresetsControls({
  state,
  updateState,
}: QrPresetsControlsProps) {
  const { toast } = useToast();

  const applyTemplate = (template: any) => {
    updateState({
      type: template.type,
      data: template.data || "",
      fgColor: template.color || state.fgColor,
      dotStyle: template.dotStyle || state.dotStyle,
      ...(template.whatsapp && { whatsapp: template.whatsapp }),
    });
    toast({
      title: "Template Applied",
      description: `Loading ${template.label} studio preset.`,
    });
  };

  const handleReset = () => {
    updateState({
      data: "https://google.com",
      logo: null,
      logoSize: 0.3,
      backgroundImage: null,
      backgroundOpacity: 0.25,
      backgroundMode: "auto",
      fgColor: "#3b82f6",
      bgColor: "#ffffff",
      type: "URL",
      dotStyle: "extra-rounded",
      cornerStyle: "rounded",
      wifi: { ssid: "", password: "", encryption: "WPA" },
      email: { address: "", subject: "", body: "" },
      whatsapp: { phone: "", message: "" },
      vCard: {
        firstName: "",
        lastName: "",
        mobile: "",
        email: "",
        organization: "",
        jobTitle: "",
        website: "",
      },
    });
    toast({
      title: "Studio Reset",
      description: "Preview restored to default.",
    });
  };
}
