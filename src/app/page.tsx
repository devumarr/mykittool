"use client";

import { useEffect, useRef, useState } from "react";
import { Hero } from "@/components/landing/hero";
import { PopularTools } from "@/components/landing/popular-tools";
import { HowItWorks } from "@/components/landing/how-it-works";

export default function Home() {
  const [count, setCount] = useState(0);
  const statsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const run = () => {
      if (timer) clearInterval(timer);
      setCount(0);
      let n = 0;
      timer = setInterval(() => {
        n += 5;
        if (n >= 130) {
          setCount(130);
          if (timer) clearInterval(timer);
        } else {
          setCount(n);
        }
      }, 16);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) run();
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, []);
  return (
    <div className="flex w-full max-w-full flex-col items-center overflow-x-hidden bg-background">
      <Hero />
      <PopularTools />
      <section
        ref={statsRef}
        className="relative isolate w-full overflow-hidden bg-background py-28"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />

        <div className="relative mx-auto max-w-5xl px-6">
          <p className="mb-16 text-center text-sm text-muted-foreground">
            A small studio. A full toolkit.
          </p>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
            <div className="group text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Library</p>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-foreground transition-transform duration-300 group-hover:scale-[1.03]">
                {count}
                <span className="text-primary">+</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                PDF, image and AI tools in one place.
              </p>
              <span className="mt-5 block h-px w-10 bg-primary/60 transition-all duration-300 group-hover:w-16" />
            </div>

            <div className="group text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Privacy</p>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-foreground transition-transform duration-300 group-hover:scale-[1.03]">
                Local
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Most work never leaves this device.
              </p>
              <span className="mt-5 block h-px w-10 bg-emerald-500/70 transition-all duration-300 group-hover:w-16" />
            </div>

            <div className="group text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Access</p>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-foreground transition-transform duration-300 group-hover:scale-[1.03]">
                Free
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                No account. Open a tool and go.
              </p>
              <span className="mt-5 block h-px w-10 bg-violet-500/70 transition-all duration-300 group-hover:w-16" />
            </div>
          </div>
        </div>
      </section>
      <HowItWorks />
    </div>
  );
}
