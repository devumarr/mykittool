"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  EyeOff,
  Database,
  Zap,
  Cloud,
  User,
  Activity,
  Mail,
  MapPin,
} from "lucide-react";

const SECTIONS = [
  {
    icon: EyeOff,
    color: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    title: "1. Local tools",
    content: "Some tools work in your browser and keep files on your device.",
  },
  {
    icon: Database,
    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    title: "2. Saved data",
    content:
      "If you use history or login, some text data can be saved with your account or in your browser localStorage. This can include tool history and profile details you enter.",
  },
  {
    icon: Zap,
    color: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    title: "3. AI tools",
    content:
      "When you use AI tools, your prompt or file text is sent to third-party AI providers so the tool can work. Do not enter passwords or private secrets into AI boxes.",
  },
  {
    icon: Cloud,
    color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    title: "4. Uploads",
    content:
      "If you use upload or hosting tools, files may be sent to the connected storage service.",
  },
  {
    icon: User,
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    title: "5. Account",
    content:
      "If you create an account, we use that login to keep your session and saved history.",
  },
  {
    icon: Activity,
    color: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    title: "6. Analytics",
    content:
      "We may collect basic technical data like browser type and page use to improve the site.",
  },
];

export default function PrivacyPolicyPage() {
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
          <Shield className="w-3.5 h-3.5" /> Compliance
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight mb-8">
          Privacy <span className="text-primary italic">Policy</span>
        </h1>
        <p className="text-lg text-foreground/70 leading-relaxed font-medium">
          Last updated: September 2026. My Kit Tool respects your privacy. This
          page explains what happens to your data.
        </p>
      </div>

      <div className="grid gap-8 mb-16">
        {SECTIONS.map((section, i) => (
          <div
            key={i}
            className="glass-card p-8 md:p-10 rounded-[2.5rem] border-border animate-reveal"
            style={{ animationDelay: `${i * 100}ms` }}
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

      <div className="glass-card p-10 rounded-[3rem] border-border animate-reveal text-center relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="flex items-center justify-center gap-3 mb-6 text-primary relative z-10">
          <Mail className="w-5 h-5" />
          <h2 className="text-2xl font-headline font-black text-foreground uppercase tracking-tight">
            7. Contact
          </h2>
        </div>
        <p className="text-sm text-foreground/70 leading-relaxed font-medium max-w-xl mx-auto relative z-10 mb-6">
          Questions about this policy? Email us. If this page changes, the date
          at the top will change.
        </p>
        <a
          href="mailto:support.mykittool@gmail.com"
          className="relative z-10 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary ring-1 ring-primary/20 hover:bg-primary/15"
        >
          <Mail className="w-4 h-4" />
          support.mykittool@gmail.com
        </a>
        <p className="relative z-10 mt-4 inline-flex items-center gap-2 text-sm text-foreground/70">
          <MapPin className="w-4 h-4 text-emerald-400" />
          Based in Pakistan
        </p>
      </div>
    </div>
  );
}
