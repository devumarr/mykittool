"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchTools } from "@/lib/tool-search";
import { TOOLS } from "@/app/all-tools/tools";

export function NavSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 56, left: 8, width: 300 });

  useEffect(() => {
    if (!open) return;
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.min(320, window.innerWidth - 16);
    let left = r.right - width;
    if (left < 8) left = 8;
    setPos({ top: r.bottom + 8, left, width });
  }, [open]);
  const input = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => searchTools(TOOLS as any, q, 6), [q]);

  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    router.push(href);
  };

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 hover:bg-secondary"
        aria-label="Search tools"
      >
        <Search className="h-4 w-4" />
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: pos.width,
          }}
          className="z-50 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:border-white/10 dark:bg-[#121214]"
        >
          <div className="flex items-center gap-2 border-b border-black/5 px-3 py-2 dark:border-white/10">
            <Search className="h-4 w-4 text-[#2563eb]" />
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && hits[0]?.href) go(hits[0].href);
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="Search tools..."
              className="h-9 w-full bg-transparent text-sm outline-none"
            />
            {q && (
              <button type="button" onClick={() => setQ("")}>
                <X className="h-4 w-4 text-foreground/40" />
              </button>
            )}
          </div>
          <div className="max-h-72 py-1 max-h-[280px] overflow-y-auto">
            {(q ? hits : TOOLS).map((t: any) => (
              <button
                key={t.href}
                type="button"
                onClick={() => go(t.href)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#2563eb]/8"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563eb]/10 text-[#2563eb]">
                  {t.icon ? <t.icon className="h-4 w-4" /> : t.title.charAt(0)}
                </span>
                <span className="truncate text-sm font-medium">{t.title}</span>
              </button>
            ))}
            {q && !hits.length && (
              <p className="px-3 py-4 text-center text-xs text-foreground/50">
                No tools
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
