"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Globe,
  Shield,
  Zap,
  Smartphone,
  Sparkles,
  ArrowLeft,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const FAQ_DATA = [
  {
    icon: Globe,
    color: "text-sky-400 bg-sky-400/10",
    q: "What is My Kit Tool?",
    a: "My Kit Tool is a free website with online tools for PDF, images, files, and AI. Most tools run in your browser.",
  },
  {
    icon: Zap,
    color: "text-amber-400 bg-amber-400/10",
    q: "Is My Kit Tool free?",
    a: "Yes. The tools are free for personal and commercial use. There is no subscription.",
  },
  {
    icon: Shield,
    color: "text-emerald-400 bg-emerald-400/10",
    q: "Do I need an account?",
    a: "No for most tools. Login is optional and only needed if you want saved history on some tools.",
  },
  {
    icon: Sparkles,
    color: "text-violet-400 bg-violet-400/10",
    q: "Which tools can I use?",
    a: "You can use AI tools, PDF and image tools, converters, QR tools, upload tools, and more. Open All Tools to see the full list.",
  },
  {
    icon: Smartphone,
    color: "text-cyan-400 bg-cyan-400/10",
    q: "Does it work on mobile?",
    a: "Yes. The site works on phones, tablets, and desktop.",
  },
  {
    icon: Mail,
    color: "text-rose-400 bg-rose-400/10",
    q: "How can I contact you?",
    a: "Email support.mykittool@gmail.com. We reply within 1–2 days.",
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-6 py-20 max-w-4xl">
      <div className="mb-12 animate-reveal">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-3 transition-all mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <HelpCircle className="w-3.5 h-3.5" /> Knowledge Base
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight mb-8">
          Frequent <span className="text-primary italic">Questions</span>
        </h1>
        <p className="text-lg text-foreground/70 leading-relaxed font-medium">
          Short answers about My Kit Tool.
        </p>
      </div>

      <div className="glass-card p-1 md:p-8 rounded-[3rem] border-border overflow-hidden animate-reveal">
        <Accordion type="single" collapsible className="w-full">
          {FAQ_DATA.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-b border-white/10 px-6 py-2 last:border-0"
            >
              <AccordionTrigger className="hover:no-underline hover:text-primary transition-all text-left group py-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${item.color}`}
                  >
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm md:text-base font-bold uppercase tracking-tight">
                    {item.q}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 pt-2 pl-12 text-sm md:text-base text-foreground/70 leading-relaxed font-medium">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-20 glass-card p-12 rounded-[3rem] border-border text-center animate-reveal">
        <h2 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight mb-4">
          Still have questions?
        </h2>
        <p className="text-sm text-foreground/70 font-medium mb-4">
          Email us. We reply within 1–2 days.
        </p>
        <a
          href="mailto:support.mykittool@gmail.com"
          className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary ring-1 ring-primary/20 hover:bg-primary/15"
        >
          <Mail className="w-4 h-4" />
          support.mykittool@gmail.com
        </a>
        <p className="mb-10 inline-flex items-center gap-2 text-sm text-foreground/70">
          <MapPin className="w-4 h-4 text-emerald-400" />
          Based in Pakistan
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Button
            asChild
            className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95"
          >
            <Link href="/all-tools">Browse all tools</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
