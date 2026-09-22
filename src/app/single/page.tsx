"use client";

import React, { useState } from "react";
import { QrGeneratorContainer } from "@/components/mykittool/qr-generator-container";
import {
  QrCode,
  Sparkles,
  BadgeCheck,
  Download,
  ShieldCheck,
  CircleHelp,
} from "lucide-react";
import { GetHelp } from "@/components/mykittool/get-help";

export default function SingleQRPage() {
  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest mb-4">
            <QrCode className="w-3.5 h-3.5" /> Studio Mode
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
            Single QR <span className="text-primary">Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
            Design a premium, branded QR code with custom logos and AI-generated
            artistic backgrounds. Perfect for social media and business cards.
          </p>
        </div>
        <div className="shrink-0 pb-2">
          <GetHelp toolId="single" />
        </div>
      </div>

      <QrGeneratorContainer forcedMode="single" />

      <FaqLuxury />
    </div>
  );
}

const FAQ_ITEMS = [
  {
    q: "Is this QR code generator free?",
    a: "Yes. You can create and download QR codes on My Kit Tool with no signup.",
    icon: BadgeCheck,
    tone: "bg-emerald-500/15 text-emerald-400",
  },
  {
    q: "Can I add my logo to the QR code?",
    a: "Yes. Upload a logo, set the size, and keep high error correction so phones can still scan it.",
    icon: Sparkles,
    tone: "bg-violet-500/15 text-violet-400",
  },
  {
    q: "Which download formats are supported?",
    a: "PNG, JPG, PDF, and SVG.",
    icon: Download,
    tone: "bg-sky-500/15 text-sky-400",
  },
  {
    q: "Does the QR code work after I download it?",
    a: "Yes. The file is a normal QR image. Print or share it, then test with your phone camera.",
    icon: QrCode,
    tone: "bg-amber-500/15 text-amber-400",
  },
  {
    q: "Is my data stored on your server?",
    a: "The QR is built in your browser. We do not store the link or file you type into this tool.",
    icon: ShieldCheck,
    tone: "bg-rose-500/15 text-rose-400",
  },
];

function FaqLuxury() {
  const [open, setOpen] = useState(0);

  return (
    <section className="mt-20 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
          <CircleHelp className="w-4 h-4" />
        </span>
        <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-primary">
          Help
        </p>
      </div>
      <h2 className="text-2xl md:text-3xl font-headline font-semibold text-foreground mb-8">
        Common questions
      </h2>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = open === i;
          const Icon = item.icon;
          return (
            <div
              key={item.q}
              className={`rounded-2xl border bg-card/90 transition-all duration-300 hover:-translate-y-0.5 ${
                isOpen ? "border-primary/40" : "border-border"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full flex items-center gap-4 px-4 md:px-5 py-4 text-left"
              >
                <span
                  className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${item.tone}`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 text-sm md:text-[15px] font-medium text-foreground">
                  {item.q}
                </span>
                <span
                  className={`shrink-0 w-7 h-7 rounded-full border border-border flex items-center justify-center text-sm text-primary transition-transform duration-300 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <p className="px-5 pb-5 text-sm text-foreground/70 leading-relaxed">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
