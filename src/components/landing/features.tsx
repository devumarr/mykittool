"use client";

import { ShieldCheck, Zap, AppWindow, Globe } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Private by default",
    description: "Most tools run in your browser. Files stay on your device.",
  },
  {
    icon: Zap,
    title: "Instant",
    description: "Open a tool and start. No install, no queue.",
  },
  {
    icon: AppWindow,
    title: "130+ tools",
    description: "PDF, images, AI and utilities in one place.",
  },
  {
    icon: Globe,
    title: "Any device",
    description: "Works on phone, tablet and desktop.",
  },
];
export function Features() {
  return (
    <section id="features" className="w-full bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-md">
          <h2 className="normal-case text-3xl font-semibold tracking-[-0.03em] text-foreground">
            Quiet software.
            <br />
            Serious tools.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Built for people who want the file done, not a dashboard.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2">
          {features.map((item) => (
            <div key={item.title} className="bg-card p-8 md:p-10">
              <item.icon className="h-4 w-4 text-primary" />
              <h3 className="mt-8 text-base font-medium text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
