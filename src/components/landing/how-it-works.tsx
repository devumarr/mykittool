"use client";

import Link from "next/link";
import {
  MousePointer2,
  DownloadCloud,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: MousePointer2,
    step: "01",
    title: "Choose a tool",
    description: "Pick what you need from the library.",
    well: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/25 dark:text-cyan-300",
    glow: "group-hover:shadow-cyan-500/20",
  },
  {
    icon: ShieldCheck,
    step: "02",
    title: "Use it here",
    description: "Work in the browser. Files stay on the device.",
    well: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300",
    glow: "group-hover:shadow-emerald-500/20",
  },
  {
    icon: DownloadCloud,
    step: "03",
    title: "Save the result",
    description: "Download or copy when you are done.",
    well: "bg-violet-100 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300",
    glow: "group-hover:shadow-violet-500/20",
  },
];

export function HowItWorks() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-background py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.10),_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(96,165,250,0.14),_transparent_55%)]" />

      <div className="relative mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            How it works
          </p>
          <h2 className="mt-2 normal-case text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Three steps. Then you are done.
          </h2>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-cyan-400/50 via-emerald-400/50 to-violet-400/50 md:block" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {steps.map((item) => (
              <div
                key={item.step}
                className={`group relative rounded-3xl bg-card p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)] ${item.glow}`}
              >
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="mb-8 flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.well} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">
                    {item.step}
                  </span>
                </div>

                <h3 className="normal-case text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/all-tools"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all duration-300 hover:gap-3 hover:shadow-[0_0_28px_rgba(37,99,235,0.55)]"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            Browse all tools
            <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
