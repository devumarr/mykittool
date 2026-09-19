"use client";

import Link from "next/link";
import {
  MessageSquare,
  Sparkles,
  User,
  QrCode,
  Mic,
  ArrowRight,
  Activity,
  Moon,
} from "lucide-react";

const popularTools = [
  {
    href: "/ai-chatbot",
    icon: MessageSquare,
    title: "AI Chatbot",
    desc: "Chat with AI in your browser.",
    well: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/25 dark:text-cyan-300",
    glow: "hover:shadow-cyan-500/25 dark:hover:shadow-cyan-400/30",
    span: "sm:col-span-2",
  },
  {
    href: "/ai-image-generator",
    icon: Moon,
    title: "AI Image Gen",
    desc: "Create images from a prompt.",
    well: "bg-violet-100 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300",
    glow: "hover:shadow-violet-500/25 dark:hover:shadow-violet-400/30",
    span: "",
  },
  {
    href: "/ai-resume-builder",
    icon: User,
    title: "Resume Builder",
    desc: "Write a clean resume fast.",
    well: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
    glow: "hover:shadow-emerald-500/25 dark:hover:shadow-emerald-400/30",
    span: "",
  },
  {
    href: "/single",
    icon: QrCode,
    title: "QR Studio",
    desc: "Make a branded QR code.",
    well: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
    glow: "hover:shadow-amber-500/25 dark:hover:shadow-amber-400/30",
    span: "",
  },

  {
    href: "/all-units-converter",
    icon: Activity,
    title: "Unit Converter",
    desc: "Convert length, weight and more.",
    well: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
    glow: "hover:shadow-blue-500/25 dark:hover:shadow-blue-400/30",
    span: "sm:col-span-2 lg:col-span-1",
  },
];

export function PopularTools() {
  return (
    <section className="relative w-full overflow-hidden bg-background py-14">
      <div className="pointer-events-none absolute left-1/2 top-12 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-2xl dark:bg-primary/10" />

      <div className="relative mx-auto max-w-5xl px-6">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Featured
            </p>
            <h2 className="mt-2 normal-case text-3xl font-semibold tracking-tight text-foreground">
              Tools people open first
            </h2>
          </div>
          <Link
            href="/all-tools"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            See all tools
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group relative ${tool.span}`}
            >
              <div
                className={`relative flex h-full flex-col rounded-3xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] ring-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(15,23,42,0.10)] dark:ring-1 dark:ring-border dark:shadow-none dark:hover:ring-primary/30 ${tool.glow}`}
              >
                <div className="mb-8 flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tool.well} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-primary" />
                </div>

                <h3 className="normal-case text-lg font-semibold tracking-tight text-foreground">
                  {tool.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {tool.desc}
                </p>

                <span className="mt-6 text-sm font-medium text-primary">
                  Open tool
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
