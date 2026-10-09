"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Are the tools free?",
    a: "Yes. Open a tool and use it. No account is required.",
  },
  {
    q: "Do you upload my PDF or photo?",
    a: "Compress, merge, and image to PDF run in the browser. The file stays on this device.",
  },
  {
    q: "How do I compress a PDF?",
    a: "Open PDF Compressor, drop the file, choose a level, and download the smaller copy.",
    href: "/pdf-compressor",
    link: "Open PDF Compressor",
  },
  {
    q: "Which tools are used most in Pakistan?",
    a: "Temp Mail, Namaz Times, and PDF Compressor.",
  },
];

export default function HomeFaq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 [overflow-anchor:none]">
      <p className="text-xs font-semibold tracking-[0.18em] text-primary">
        FAQ
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Questions people ask first
      </h2>
      <div className="mt-6 space-y-3">
        {faqs.map((item, i) => (
          <div
            key={item.q}
            className="rounded-2xl border bg-white px-5 py-4 shadow-sm dark:bg-background"
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setOpen(open === i ? -1 : i);
              }}
              className="flex w-full items-center justify-between gap-4 text-left font-medium"
            >
              {item.q}
              <span className="text-primary">{open === i ? "–" : "+"}</span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-xl pt-3 text-sm leading-6 text-foreground/70">
                  {item.a}
                </p>
                {"href" in item && item.href ? (
                  <a
                    href={item.href}
                    className="mt-3 inline-block pb-1 text-sm font-medium text-primary"
                  >
                    {item.link} →
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
