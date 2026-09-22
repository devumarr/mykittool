"use client";

import React, { useState } from "react";
import {
  Coffee,
  Copy,
  CheckCircle2,
  Smartphone,
  ShieldAlert,
  Heart,
  Zap,
  QrCode,
  Globe,
  Coins,
  BadgeCheck,
  Star,
  EyeOff,
  HandHeart,
  HelpCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GetHelp } from "@/components/mykittool/get-help";

export default function DonatePage() {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({
      title: "Copied",
      description: "Thanks for supporting My Kit Tool.",
    });
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div className="relative mb-20 overflow-hidden rounded-[2.2rem] border border-white/10 bg-gradient-to-b from-primary/10 via-background to-background px-6 py-16 text-center shadow-[0_30px_80px_rgba(37,99,235,0.12)] md:px-12 md:py-20">
      <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-orange-400/20 blur-3xl" />

      <div className="relative mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white shadow-[0_16px_40px_rgba(37,99,235,0.45)] transition-transform duration-500 hover:rotate-6 hover:scale-110">
        <Coffee className="h-9 w-9" />
      </div>

      <p className="relative mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
        Support the studio
      </p>
      <h1 className="relative text-4xl font-black tracking-tight text-foreground md:text-6xl">
        Buy me a{" "}
        <span className="bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#fb923c] bg-clip-text text-transparent">
          coffee
        </span>
      </h1>
      <p className="relative mx-auto mt-4 max-w-lg text-sm leading-relaxed text-foreground/70 md:text-base">
        Keep 130+ tools free. No ads. No paywall. A small coffee helps the next
        tool ship.
      </p>
      <div className="relative mb-12 mt-8 flex justify-center">
        <div className="[&_button]:h-12 [&_button]:rounded-full [&_button]:border-0 [&_button]:bg-gradient-to-r [&_button]:from-[#2563eb] [&_button]:to-[#60a5fa] [&_button]:px-7 [&_button]:text-sm [&_button]:font-semibold [&_button]:text-white [&_button]:shadow-[0_12px_30px_rgba(37,99,235,0.35)] [&_button]:transition-transform [&_button]:duration-300 hover:[&_button]:scale-105">
          <GetHelp toolId="donate" />
        </div>
      </div>

      <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Heart,
            title: "100% free",
            desc: "No subscription.",
            color: "from-rose-500 to-orange-400",
            glow: "group-hover:shadow-rose-500/25",
          },
          {
            icon: EyeOff,
            title: "No forced ads",
            desc: "Clean workspace.",
            color: "from-violet-500 to-indigo-400",
            glow: "group-hover:shadow-violet-500/25",
          },
          {
            icon: Zap,
            title: "Runs locally",
            desc: "Most tools in browser.",
            color: "from-amber-400 to-orange-400",
            glow: "group-hover:shadow-amber-400/25",
          },
          {
            icon: HandHeart,
            title: "Optional",
            desc: "Never required.",
            color: "from-sky-500 to-cyan-400",
            glow: "group-hover:shadow-sky-500/25",
          },
        ].map((item) => (
          <div
            key={item.title}
            className={cn(
              "group relative overflow-hidden rounded-[1.6rem] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.04]",
              item.glow,
            )}
          >
            <div
              className={cn(
                "absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-50",
                item.color,
              )}
            />
            <div
              className={cn(
                "absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r",
                item.color,
              )}
            />
            <div
              className={cn(
                "relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110",
                item.color,
              )}
            >
              <item.icon className="h-6 w-6" />
            </div>
            <h4 className="relative text-base font-semibold tracking-tight text-foreground">
              {item.title}
            </h4>
            <p className="relative mt-2 text-sm leading-relaxed text-foreground/60">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white shadow-lg shadow-blue-500/30">
          <Smartphone className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-2xl font-black tracking-tight text-foreground">
            How to send
          </h3>
          <p className="text-sm text-foreground/60">Pakistan or worldwide</p>
        </div>
      </div>

      <div className="mb-16 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <Card className="group relative overflow-hidden rounded-[1.8rem] border border-black/5 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(37,99,235,0.16)] dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-400 to-sky-400" />
          <CardHeader className="border-b border-black/5 bg-emerald-500/5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-md">
                  <Smartphone className="h-5 w-5" />
                </div>
                Pakistan
              </CardTitle>
              <Badge className="border-0 bg-emerald-500/15 text-emerald-600">
                Local
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-7 pt-8">
            <p className="text-sm text-foreground/65">
              Send any amount. No login needed.
            </p>

            <div className="grid grid-cols-2 gap-4 items-start">
              {/* LEFT — Easypaisa */}
              <div className="flex flex-col items-center gap-2">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=03194259023"
                  alt="Easypaisa QR"
                  className="h-32 w-32 rounded-2xl bg-white p-2"
                />
                <p className="text-xs text-foreground/60">Easypaisa</p>
                <div className="flex w-full items-center gap-2">
                  <div className="flex h-11 flex-1 items-center overflow-hidden rounded-xl border border-black/10 px-3 text-sm">
                    03194259023
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleCopy("03194259023", "easypaisa")}
                    className="h-9 w-9 shrink-0 rounded-xl bg-[#2563eb]"
                  >
                    {isCopied === "easypaisa" ? <CheckCircle2 /> : <Copy />}
                  </Button>
                </div>
              </div>

              {/* RIGHT — Bank */}
              <div className="flex flex-col items-center gap-2">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PK26MEZN0000300112583758"
                  alt="RAAST IBAN QR"
                  className="h-32 w-32 rounded-2xl bg-white p-2"
                />
                <p className="text-xs text-foreground/60">Bank / RAAST</p>
                <div className="flex w-full items-center gap-2">
                  <div className="flex h-11 flex-1 items-center overflow-hidden rounded-xl border border-black/10 px-2 text-[11px]">
                    PK26MEZN0000300112583758
                  </div>
                  <Button
                    type="button"
                    onClick={() =>
                      handleCopy("PK26MEZN0000300112583758", "iban")
                    }
                    className="h-9 w-9 shrink-0 rounded-xl bg-[#2563eb]"
                  >
                    {isCopied === "iban" ? <CheckCircle2 /> : <Copy />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {["Rs 100", "Rs 500", "Rs 1000"].map((tier) => (
                <span
                  key={tier}
                  className="rounded-full border border-black/5 bg-white px-3 py-1.5 text-xs font-semibold text-foreground/70 shadow-sm dark:bg-white/5"
                >
                  {tier}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden rounded-[1.8rem] border border-black/5 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(37,99,235,0.16)] dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#2563eb] to-orange-400" />
          <CardHeader className="border-b border-black/5 bg-blue-500/5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white shadow-md">
                  <Globe className="h-5 w-5" />
                </div>
                Worldwide
              </CardTitle>
              <Badge className="border-0 bg-blue-500/15 text-blue-600">
                USDT TRC20
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-7 pt-8">
            <div className="flex flex-col items-center gap-5">
              <div className="flex h-40 w-40 items-center justify-center rounded-[1.6rem] bg-white shadow-xl ring-1 ring-black/5 transition-transform duration-500 group-hover:scale-105">
                <div className="relative flex h-full w-full items-center justify-center rounded-[1.2rem] bg-slate-50">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=TDhUm3utKqQ4sE974RCRefAFpdNAVGcLtQ"
                    alt="USDT TRC20 QR"
                    className="h-48 w-48 rounded-1xl bg-white p-2"
                  />
                </div>
              </div>
              <div className="w-full space-y-2">
                <Label className="text-xs text-foreground/55">
                  USDT address
                </Label>
                <div className="flex gap-2">
                  <div className="flex h-14 flex-1 items-center overflow-hidden rounded-2xl border border-black/5 bg-secondary/70 px-4 font-mono text-[10px] font-bold sm:text-xs">
                    TDhUm3utKqQ4sE974RCRefAFpdNAVGcLtQ
                  </div>
                  <Button
                    onClick={() =>
                      handleCopy("TDhUm3utKqQ4sE974RCRefAFpdNAVGcLtQ", "usdt")
                    }
                    className="h-14 w-14 rounded-2xl bg-[#2563eb] shadow-lg shadow-blue-500/25 transition-transform hover:scale-105"
                  >
                    {isCopied === "usdt" ? <CheckCircle2 /> : <Copy />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-500/5 p-4">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <p className="text-xs leading-relaxed text-red-500/80">
                Send only on TRC20. Wrong network can lose funds.
              </p>
            </div>
          </CardContent>
        </Card>
        <div>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black tracking-tight">
              After you send
            </h3>
          </div>
          <div className="space-y-3 rounded-[1.8rem] border border-black/5 bg-white/80 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-white/[0.04]">
            {[
              "No automated thank-you email.",
              "Studio stays free for everyone.",
              "We do not require your identity.",
              "Contact is optional.",
            ].map((text) => (
              <div
                key={text}
                className="flex items-center gap-3 rounded-2xl border border-transparent bg-transparent px-4 py-3 transition-all duration-300 hover:-translate-x-0.5 hover:border-emerald-500/20 hover:bg-emerald-500/5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-foreground/75">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="min-w-0">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black">FAQ</h3>
            </div>
            <div className="rounded-[1.8rem] border border-black/5 bg-white/80 p-2 dark:border-white/10 dark:bg-white/[0.04]">
              <Accordion type="single" collapsible className="w-full">
                {[
                  { q: "Is this required?", a: "No. Every tool stays free." },
                  { q: "Minimum amount?", a: "None. Any amount helps." },
                  {
                    q: "Extra features?",
                    a: "No. Everyone already has full access.",
                  },
                  { q: "Automatic payment?", a: "No. Copy and send manually." },
                ].map((item, i) => (
                  <AccordionItem
                    key={item.q}
                    value={`item-${i}`}
                    className="px-2"
                  >
                    <AccordionTrigger className="text-sm font-semibold">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-foreground/65">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-gradient-to-b from-[#2563eb]/10 via-white to-white p-12 text-center shadow-[0_20px_60px_rgba(37,99,235,0.12)] dark:border-white/10 dark:from-[#2563eb]/20 dark:via-background dark:to-background">
        <div className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-8 bottom-0 h-36 w-36 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="relative mb-5 flex justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-lg transition-transform duration-300 hover:scale-110">
            <Heart className="h-5 w-5" />
          </span>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg transition-transform duration-300 hover:scale-110">
            <Star className="h-5 w-5" />
          </span>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white shadow-lg transition-transform duration-300 hover:scale-110">
            <BadgeCheck className="h-5 w-5" />
          </span>
        </div>
        <h3 className="relative text-3xl font-black tracking-tight text-foreground">
          Thank you
        </h3>
        <p className="relative mx-auto mt-3 max-w-lg text-sm leading-relaxed text-foreground/70">
          Support helps keep My Kit Tool free and running.
        </p>
      </div>
    </div>
  );
}
