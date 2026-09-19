"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  // --- Usage Logic ---
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const raw = localStorage.getItem("mykit_local_usage_log");
      if (raw) {
        const data = JSON.parse(raw);
        if (data.date === todayStr) {
          setUsageCount(data.paths.length);
        }
      }
    } catch (e) {}
  }, []);

  // --- Linguistic Typewriter Matrix ---
  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const words = useMemo(
    () => [
      "AI Chatbot",
      "Resume Builder",
      "PDF Merger",
      "Image Generator",
      "Logo Maker",
      "Photo to Text",
      "Background Remove",
      "Password Generator",
      "Units Converter",
      "Speed Test",
      "Email Writer",
      "QR Studio",
    ],
    [],
  );

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % words.length;
      const fullText = words[i];

      setPlaceholderText(
        isDeleting
          ? fullText.substring(0, placeholderText.length - 1)
          : fullText.substring(0, placeholderText.length + 1),
      );

      setTypingSpeed(isDeleting ? 50 : 150);

      if (!isDeleting && placeholderText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && placeholderText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, loopNum, typingSpeed, words]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/all-tools?q=${encodeURIComponent(query.trim())}`);
    }
  };
  return (
    <section className="relative w-full overflow-hidden bg-background pt-28 pb-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border" />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center px-6 text-center">
        <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[13px] font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          130+ tools · works in your browser
        </span>

        <h1 className="normal-case text-[32px] font-semibold leading-[1.15] tracking-[-0.03em] text-foreground md:text-6xl">
          Free tools for PDF,
          <br />
          images and AI
        </h1>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-lg">
          Compress a{" "}
          <span className="font-medium text-rose-600 dark:text-rose-400">
            photo
          </span>
          , build a{" "}
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            resume
          </span>
          , or chat with{" "}
          <span className="font-medium text-violet-600 dark:text-violet-400">
            AI
          </span>
          . No install. No signup.
        </p>

        <form onSubmit={handleSearch} className="mt-10 w-full">
          <div className="flex h-12 items-center rounded-2xl border border-border bg-card pl-4 pr-1.5 shadow-sm transition-[border,box-shadow] focus-within:border-primary/40 focus-within:shadow-md md:h-14">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${placeholderText || "tools"}...`}
              className="h-12 border-0 bg-transparent p-0 text-[15px] text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
              aria-label="Search all tools"
            />
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="mt-5 flex items-center gap-3 text-[13px] md:text-sm">
          <span className="font-medium text-blue-600 dark:text-blue-400">
            PDF
          </span>
          <span className="h-0.5 w-0.5 rounded-full bg-border" />
          <span className="font-medium text-rose-600 dark:text-rose-400">
            Images
          </span>
          <span className="h-0.5 w-0.5 rounded-full bg-border" />
          <span className="font-medium text-violet-600 dark:text-violet-400">
            AI
          </span>
        </div>
        <button
          onClick={() => router.push("/all-tools")}
          className="group mt-10 inline-flex items-center gap-1.5 text-[14px] font-medium text-foreground/80 hover:text-primary"
        >
          See all tools
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </section>
  );
}
