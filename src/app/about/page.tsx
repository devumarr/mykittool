"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Heart,
  Coffee,
  ExternalLink,
  LayoutGrid,
  Smartphone,
  Box,
  Gamepad2,
  Wand2,
  ArrowRight,
  Shield,
  MessageSquare,
  Sword,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PROJECTS = [
  {
    name: "Vortex Reach",
    url: "https://vortexreach.vercel.app/",
    desc: "Social services and marketing panel.",
    icon: Zap,
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    name: "Trade Vission",
    url: "https://studio-nu-sandy.vercel.app/",
    desc: "Digital creative production studio.",
    icon: Wand2,
    color: "text-indigo-500 bg-indigo-500/10",
  },
  {
    name: "Countora",
    url: "https://countora.vercel.app/",
    desc: "Shop accounts and ledger manager.",
    icon: LayoutGrid,
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    name: "Fitt Pic",
    url: "https://fittpic.vercel.app/",
    desc: "WhatsApp DP optimization.",
    icon: Smartphone,
    color: "text-cyan-500 bg-cyan-500/10",
  },
  {
    name: "APK Vault",
    url: "https://apkvault.vercel.app/",
    desc: "Secure Android app library.",
    icon: Box,
    color: "text-orange-500 bg-orange-500/10",
  },
  {
    name: "LootPro",
    url: "https://lootpro.vercel.app/",
    desc: "Curated deals and loot.",
    icon: Gamepad2,
    color: "text-rose-500 bg-rose-500/10",
  },
  {
    name: "Name Pix",
    url: "https://namepix.vercel.app/",
    desc: "Stylish names for games. Fonts + symbols.",
    icon: Sword,
    color: "text-yellow-500 bg-yellow-500/10",
  },
  {
    name: "OMAR CHEAT CODE",
    url: "https://omarcheatscode.vercel.app/",
    desc: "Gaming scripts and optimization.",
    icon: Zap,
    color: "text-red-500 bg-red-500/10",
  },
  {
    name: "MY KIT TOOL",
    url: "https://qrcode-amber-ten.vercel.app/",
    desc: "Artistic QR code generator.",
    icon: QrCode,
    color: "text-blue-500 bg-blue-500/10",
  },
];

export default function AboutPage() {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const email = "ummarfarooq38990@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setIsCopied(true);
    toast({ title: "Copied", description: "Email saved to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
    const [n, setN] = useState(0);
    const [on, setOn] = useState(false);
    const ref = React.useRef<HTMLSpanElement>(null);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => setOn(entry.isIntersecting),
        { threshold: 0.4 },
      );
      io.observe(el);
      return () => io.disconnect();
    }, []);

    useEffect(() => {
      if (!on) {
        setN(0);
        return;
      }
      let frame = 0;
      const total = 40;
      let id = 0;
      const tick = () => {
        frame++;
        setN(Math.round((end * frame) / total));
        if (frame < total) id = requestAnimationFrame(tick);
      };
      id = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(id);
    }, [on, end]);

    return (
      <span ref={ref}>
        {n}
        {suffix}
      </span>
    );
  }

  return (
    <div className="w-full bg-background pb-24 text-foreground">
      <div className="sticky top-16 z-40 flex justify-center pt-5">
        <div className="flex gap-6 rounded-full border border-black/5 bg-white/90 px-6 py-2.5 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
          {["about", "work", "contact"].map((item) => (
            <button
              key={item}
              onClick={() => scrollTo(item)}
              className="text-xs font-semibold capitalize text-foreground/50 hover:text-primary"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <section
        id="about"
        className="container mx-auto px-6 pb-24 pt-20 text-center"
      >
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
          About
        </p>
        <h1 className="text-5xl font-black tracking-tight md:text-7xl">
          Umar <span className="text-[#2563eb]">Farooq</span>
        </h1>
        <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#2563eb] to-orange-400" />
        <p className="mt-4 text-sm font-medium text-foreground/55">
          Builder of free browser tools
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground/70">
          I build small digital products to make daily work easier. Privacy
          first. Zero friction. Free forever.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => scrollTo("contact")}
            className="h-12 rounded-2xl bg-[#2563eb] px-6 text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-105"
          >
            Email support
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-2xl px-6">
            <Link href="/donate">Buy me a coffee</Link>
          </Button>
          <Button asChild variant="ghost" className="h-12 rounded-2xl px-6">
            <Link href="/">
              Explore tools <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto mb-24 px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Studio tools",
              end: 200,
              suffix: "+",
              icon: LayoutGrid,
              from: "from-[#2563eb]",
              to: "to-[#60a5fa]",
            },
            {
              label: "Other projects",
              end: 9,
              suffix: "",
              icon: Zap,
              from: "from-orange-400",
              to: "to-amber-300",
            },
            {
              label: "Privacy first",
              end: 100,
              suffix: "%",
              icon: ShieldCheck,
              from: "from-emerald-500",
              to: "to-teal-400",
            },
            {
              label: "Access",
              end: 1,
              suffix: "",
              icon: Heart,
              from: "from-rose-500",
              to: "to-pink-400",
              text: "Free",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group rounded-[1.6rem] border border-black/5 bg-white p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(37,99,235,0.14)] dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div
                className={cn(
                  "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6",
                  stat.from,
                  stat.to,
                )}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-black">
                {stat.text || <CountUp end={stat.end} suffix={stat.suffix} />}
              </p>
              <p className="mt-1 text-xs text-foreground/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 pb-24">
        <div className="mb-12 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Standard
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-tight">
            How I help
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Wand2,
              title: "Free forever",
              desc: "No subscriptions. Every tool stays open.",
              from: "from-[#2563eb]",
              to: "to-[#60a5fa]",
            },
            {
              icon: Shield,
              title: "Privacy first",
              desc: "Most work runs on your device.",
              from: "from-emerald-500",
              to: "to-teal-400",
            },
            {
              icon: Smartphone,
              title: "Zero friction",
              desc: "Fast, mobile-friendly, instant use.",
              from: "from-orange-400",
              to: "to-amber-300",
            },
            {
              icon: MessageSquare,
              title: "Direct support",
              desc: "Email reply, usually within 24 hours.",
              from: "from-violet-500",
              to: "to-fuchsia-400",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="group rounded-[1.6rem] border border-black/5 bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(37,99,235,0.14)] dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div
                className={cn(
                  "mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6",
                  card.from,
                  card.to,
                )}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="work" className="container mx-auto px-6 pb-24">
        <div className="mb-12 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/45">
            Ecosystem
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-tight">
            Other <span className="text-[#2563eb]">projects</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project) => (
            <div
              key={project.name}
              className="group relative flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-black/5 bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(37,99,235,0.16)] dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-orange-400 opacity-70" />
              <div
                className={cn(
                  "mb-6 flex h-14 w-14 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6",
                  project.color,
                )}
              >
                <project.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black tracking-tight">
                {project.name}
              </h3>
              <p className="mb-8 mt-2 flex-1 text-sm leading-relaxed text-foreground/60">
                {project.desc}
              </p>
              <Button
                asChild
                variant="outline"
                className="h-12 w-full rounded-2xl transition-all group-hover:bg-[#2563eb] group-hover:text-white"
              >
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  Visit <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="container mx-auto px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="group overflow-hidden rounded-[1.8rem] border-black/5 bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(37,99,235,0.14)] dark:border-white/10 dark:bg-white/[0.04] md:p-12">
            <div className="mb-6 h-[3px] rounded-full bg-gradient-to-r from-[#2563eb] to-[#60a5fa]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Support
            </p>
            <h3 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Feedback & <span className="text-[#2563eb]">email</span>
            </h3>
            <p className="mt-3 text-sm text-foreground/60">
              Issue or request? I usually reply within 24 hours.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-14 flex-1 items-center overflow-hidden rounded-2xl bg-secondary px-4 font-mono text-xs">
                {email}
              </div>
              <Button
                onClick={handleCopyEmail}
                className="h-14 w-14 shrink-0 rounded-2xl bg-[#2563eb] text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-105"
              >
                {isCopied ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-14 rounded-2xl px-5 hover:bg-[#2563eb] hover:text-white"
              >
                <a href={`mailto:${email}`}>Open mail</a>
              </Button>
            </div>
          </Card>

          <Card className="group flex flex-col items-center overflow-hidden rounded-[1.8rem] border-black/5 bg-white p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(249,115,22,0.16)] dark:border-white/10 dark:bg-white/[0.04] md:p-12">
            <div className="mb-6 h-[3px] w-full rounded-full bg-gradient-to-r from-orange-400 to-amber-300" />
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-300 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Coffee className="h-8 w-8" />
            </div>
            <h3 className="text-3xl font-black tracking-tight">
              Fuel the <span className="text-orange-500">studio</span>
            </h3>
            <p className="mt-3 max-w-sm text-sm text-foreground/60">
              Optional support for servers and new free tools.
            </p>
            <Button
              asChild
              className="mt-8 h-12 w-full max-w-sm rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.02]"
            >
              <Link href="/donate">Buy me a coffee</Link>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
