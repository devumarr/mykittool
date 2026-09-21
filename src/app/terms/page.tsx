"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  ShieldCheck,
  Scale,
  AlertCircle,
  Gavel,
  FileSignature,
  Zap,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
  const sections = [
    {
      icon: Zap,
      color: "text-sky-400 bg-sky-400/10 border-sky-400/20",
      title: "1. The Service",
      content:
        "My Kit Tool is a free online tools website. Features may change, pause, or stop at any time.",
    },
    {
      icon: FileSignature,
      color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
      title: "2. Your Content",
      content:
        "You are responsible for the text, images, files, and prompts you upload. As between you and My Kit Tool, we do not claim ownership of your inputs or the files you download. Third-party AI or hosting services may have their own rules. You must follow those too.",
    },
    {
      icon: Gavel,
      color: "text-rose-400 bg-rose-400/10 border-rose-400/20",
      title: "3. Acceptable Use",
      content:
        "Do not use My Kit Tool to: break the law, harm others, spread malware or phishing, or abuse/overload the service. We may block access if these rules are broken.",
    },
    {
      icon: AlertCircle,
      color: "text-violet-400 bg-violet-400/10 border-violet-400/20",
      title: "4. AI Results",
      content:
        "AI tools can make mistakes. Always check resumes, emails, code, and images before you use them. We do not guarantee accuracy.",
    },
    {
      icon: ShieldCheck,
      color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      title: "5. No Warranty",
      content:
        "The site is provided as is. We are not responsible for lost data, downtime, or results from the tools.",
    },
    {
      icon: Scale,
      color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
      title: "6. Changes",
      content:
        "These terms may be updated. Continued use means you accept the new terms.",
    },
  ];

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
          <FileText className="w-3.5 h-3.5" /> Agreement
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight mb-8">
          Terms of <span className="text-primary italic">Service</span>
        </h1>
        <p className="text-lg text-foreground/70 leading-relaxed font-medium">
          By using My Kit Tool, you agree to these terms.
        </p>
      </div>

      <div className="grid gap-8 mb-16">
        {sections.map((section, i) => (
          <div
            key={i}
            className="glass-card p-8 md:p-10 rounded-[2.5rem] border-border animate-reveal"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <div className="flex items-start gap-6">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${section.color}`}
              >
                <section.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-headline font-bold text-foreground mb-4 uppercase tracking-tight">
                  {section.title}
                </h3>
                <p className="text-sm md:text-base text-foreground/70 leading-relaxed font-medium">
                  {section.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-12 rounded-[3.5rem] border-border animate-reveal text-center relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
        <h2 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight mb-4 relative z-10">
          Contact
        </h2>
        <p className="text-sm text-foreground/70 font-medium mb-6 max-w-xl mx-auto relative z-10">
          Questions about these terms? Email us.
        </p>
        <a
          href="mailto:support.mykittool@gmail.com"
          className="relative z-10 mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary ring-1 ring-primary/20 hover:bg-primary/15"
        >
          <Mail className="w-4 h-4" />
          support.mykittool@gmail.com
        </a>
        <p className="relative z-10 mb-10 inline-flex items-center gap-2 text-sm text-foreground/70">
          <MapPin className="w-4 h-4 text-emerald-400" />
          Based in Pakistan
        </p>
        <Button
          asChild
          className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 relative z-10 active:scale-95 transition-all"
        >
          <Link href="/">I Understand</Link>
        </Button>
      </div>
    </div>
  );
}
