"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggle}
      className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/50 text-foreground transition-transform duration-300 hover:rotate-12 hover:text-primary active:scale-90 sm:h-10 sm:w-10"
    >
      <span className="relative h-4 w-4">
        <Sun
          className={`absolute inset-0 h-4 w-4 transition-all duration-500 ${
            isDark ? "-rotate-90 scale-0" : "rotate-0 scale-100"
          }`}
        />
        <Moon
          className={`absolute inset-0 h-4 w-4 transition-all duration-500 ${
            isDark ? "rotate-0 scale-100" : "rotate-90 scale-0"
          }`}
        />
      </span>
    </button>
  );
}
