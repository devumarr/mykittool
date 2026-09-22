"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  LayoutGrid,
  List,
  ArrowRight,
  BrainCircuit,
  ImageIcon,
  FileText,
  Zap,
  Activity,
  History,
  CheckCircle2,
  X,
  Filter,
  ChevronRight,
  Monitor,
  Layout,
  Command,
  HelpCircle,
  Loader2,
  AlertCircle,
  MessageSquare,
  User,
  Mail,
  Code2,
  Sparkles,
  Mic,
  Volume2,
  Wand2,
  Music,
  QrCode,
  Eraser,
  Globe,
  EyeOff,
  FileImage,
  Film,
  Stamp,
  Frame,
  MonitorPlay,
  Tv,
  Box,
  ShieldCheck,
  Pipette,
  RefreshCcw,
  Maximize,
  Minimize,
  Palette,
  Type,
  Grid3X3,
  Shapes,
  MousePointer2,
  RotateCcw,
  CloudUpload,
  FileArchive,
  Database,
  Globe2,
  Share2,
  FileEdit,
  FileCode,
  Unlock,
  Lock,
  Scissors,
  Archive,
  Layers,
  FileUp,
  FileDown,
  ListMusic,
  Hammer,
  Mic2,
  ShieldAlert,
  Network,
  Github,
  Gamepad2,
  Languages,
  Calendar,
  Lightbulb,
  Smile,
  TrendingUp,
  Book,
  Clock,
  Cloud,
  Gauge,
  Coins,
  Keyboard,
  Maximize2,
  Table,
  UserCircle,
  Scale,
  Trophy,
  Calculator,
  Wifi,
  AlignLeft,
  Fingerprint,
  Hash,
  Braces,
  UserPlus,
  Smartphone,
  Copy,
  Download,
  CircleDollarSign,
  UserRound,
  Camera as CameraIcon,
} from "lucide-react";
import { TOOLS } from "./tools";
import { searchTools } from "@/lib/tool-search";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ToolCategory = "AI" | "Image" | "File" | "Other";

interface Tool {
  href: string;
  title: string;
  desc: string;
  category: ToolCategory;
  icon: React.ElementType;
  keywords?: string[];
}

const CATEGORIES: {
  id: "all" | ToolCategory;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "all", label: "All", icon: Command },
  { id: "AI", label: "AI", icon: BrainCircuit },
  { id: "Image", label: "Image", icon: ImageIcon },
  { id: "File", label: "File", icon: FileText },
  { id: "Other", label: "Other", icon: Zap },
];
const ICON_COLORS = [
  "bg-sky-500/15 text-sky-600",
  "bg-violet-500/15 text-violet-600",
  "bg-emerald-500/15 text-emerald-600",
  "bg-amber-500/15 text-amber-600",
  "bg-rose-500/15 text-rose-600",
  "bg-indigo-500/15 text-indigo-600",
  "bg-teal-500/15 text-teal-600",
  "bg-orange-500/15 text-orange-600",
  "bg-fuchsia-500/15 text-fuchsia-600",
  "bg-cyan-500/15 text-cyan-600",
];

function iconColor(href: string) {
  let n = 0;
  for (let i = 0; i < href.length; i++) n += href.charCodeAt(i);
  return ICON_COLORS[n % ICON_COLORS.length];
}

const levenshteinDistance = (a: string, b: string): number => {
  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i += 1) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator,
      );
    }
  }
  return matrix[b.length][a.length];
};

function AllToolsPageContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | ToolCategory>(
    "all",
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const queryFromUrl = searchParams.get("q");
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
    }
  }, [searchParams]);

  const { displayedTools, didYouMean, foundCount } = useMemo(() => {
    const categoryFilteredTools = TOOLS.filter(
      (tool) => activeCategory === "all" || tool.category === activeCategory,
    );

    if (!searchQuery.trim()) {
      return {
        displayedTools: categoryFilteredTools,
        didYouMean: null,
        foundCount: categoryFilteredTools.length,
      };
    }

    const displayedTools = searchTools(categoryFilteredTools, searchQuery, 8);
    return {
      displayedTools,
      didYouMean:
        displayedTools[0] && displayedTools.length
          ? displayedTools[0].title
          : null,
      foundCount: displayedTools.length,
    };
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground/80 selection:bg-primary/20 animate-reveal">
      {/* Atmospheric Depth */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full" />
      </div>

      <main className="container mx-auto px-6 py-20 relative z-20">
        {/* Header Section */}
        <div className="relative mx-auto mb-14 max-w-2xl text-center">
          <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-56 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />

          <p className="relative text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {TOOLS.length} tools
          </p>
          <h1 className="relative mt-3 normal-case text-3xl font-semibold tracking-tight text-foreground md:text-5xl transition-transform duration-300 group-hover:scale-110">
            Find a tool.
            <span className="text-primary"> Use it now.</span>
          </h1>
          <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            My Kit Tool is a free collection of online utilities for PDF, image,
            AI, audio, and everyday work. Use this page to open any tool in your
            browser. No signup required.
          </p>
          <div className="relative mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              {
                q: "pdf",
                cls: "border-blue-400/70 text-blue-700 shadow-[0_0_12px_rgba(59,130,246,0.18)] dark:border-blue-400/50 dark:text-blue-300",
              },
              {
                q: "image",
                cls: "border-rose-400/70 text-rose-700 shadow-[0_0_12px_rgba(244,63,94,0.18)] dark:border-rose-400/50 dark:text-rose-300",
              },
              {
                q: "resume",
                cls: "border-emerald-400/70 text-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.18)] dark:border-emerald-400/50 dark:text-emerald-300",
              },
              {
                q: "qr",
                cls: "border-amber-400/70 text-amber-700 shadow-[0_0_12px_rgba(245,158,11,0.18)] dark:border-amber-400/50 dark:text-amber-300",
              },
              {
                q: "compress",
                cls: "border-violet-400/70 text-violet-700 shadow-[0_0_12px_rgba(139,92,246,0.18)] dark:border-violet-400/50 dark:text-violet-300",
              },
            ].map((item) => (
              <button
                key={item.q}
                type="button"
                onClick={() => setSearchQuery(item.q)}
                className={`rounded-full border bg-background px-3.5 py-1.5 text-xs font-medium transition-transform duration-300 hover:-translate-y-0.5 hover:scale-[1.04] ${item.cls}`}
              >
                {item.q}
              </button>
            ))}
          </div>
        </div>

        {/* Recalibrated Desktop Controller Bar */}
        <div className="sticky top-20 z-[80] mb-12 flex flex-col items-center gap-6">
          <div className="w-full max-w-4xl group/search">
            <div className="absolute -inset-4 bg-primary/10 blur-[40px] rounded-full pointer-events-none opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-1000" />
            <div className="relative bg-background/60 backdrop-blur-3xl border border-foreground/5 rounded-3xl h-16 shadow-2xl flex items-center px-6 transition-all group-focus-within/search:border-primary/40">
              <Search className="w-4 h-4 text-foreground/20 group-focus-within/search:text-primary transition-colors" />
              <Input
                type="text"
                placeholder={`Search ${TOOLS.length} tools... (e.g. AI, PDF, Image)`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-sm font-bold placeholder:text-foreground/20 focus-visible:ring-0"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-2 text-foreground/20 hover:text-foreground transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 w-full px-2">
            <div className="w-auto max-w-full overflow-x-auto no-scrollbar bg-foreground/[0.02] border border-foreground/5 rounded-2xl p-1.5">
              <div className="flex items-center space-x-1 min-w-max">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground shadow-xl"
                        : "text-foreground/30 hover:text-foreground/60 hover:bg-foreground/5",
                    )}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-foreground/[0.02] backdrop-blur-3xl border border-foreground/5 rounded-2xl p-1.5 shadow-2xl shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-foreground/20 hover:text-foreground",
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-foreground/20 hover:text-foreground",
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <p className="mt-6 mb-2 text-center text-sm">
          <a
            href="https://whatsapp.com/channel/0029Vb8K2p24Crfd31KVcv26"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            New tools? Follow on WhatsApp
          </a>
        </p>
        {/* Status Matrix */}
        <div className="max-w-5xl mx-auto mb-12 px-4 flex flex-col items-center gap-4">
          {didYouMean && (
            <div className="animate-in slide-in-from-top-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">
                Did you mean:{" "}
                <button
                  onClick={() => setSearchQuery(didYouMean)}
                  className="text-primary hover:underline"
                >
                  {didYouMean}
                </button>
                ?
              </p>
            </div>
          )}

          {searchQuery && foundCount === 0 && (
            <div className="py-32 text-center opacity-10 flex flex-col items-center gap-8">
              <AlertCircle className="w-10 h-10 text-primary" />
              <div className="space-y-2">
                <p className="font-headline font-black text-2xl uppercase tracking-widest text-foreground">
                  Zero Matches
                </p>
                <p className="text-sm font-bold uppercase text-foreground">
                  not found.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Compact Results Matrix */}
        <div
          className={cn(
            "max-w-7xl mx-auto transition-all duration-500 pb-32",
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-2",
          )}
        >
          {displayedTools.map((tool) => (
            <a href={tool.href} key={tool.href} className="block group">
              {viewMode === "grid" ? (
                <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_10px_28px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_20px_40px_rgba(0,0,0,0.35)]">
                  <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div
                      className={cn(
                        "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40",
                        iconColor(tool.href),
                      )}
                    >
                      {tool.icon ? (
                        <tool.icon size={18} />
                      ) : (
                        tool.title.charAt(0)
                      )}
                    </div>
                    <h3 className="font-headline font-black text-base text-foreground uppercase tracking-tight leading-none mb-2 group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase tracking-tighter line-clamp-2">
                      {tool.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-foreground/5 flex items-center justify-between relative z-10">
                    <span className="text-[8px] font-black text-foreground/10 group-hover:text-primary transition-colors uppercase tracking-[0.3em]">
                      Initialize
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-foreground/10 group-hover:text-primary transition-all group-hover:translate-x-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="py-4 px-6 bg-card border border-foreground/5 rounded-2xl hover:border-primary/20 transition-all flex justify-between items-center group/row">
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div
                      className={cn(
                        "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40",
                        iconColor(tool.href),
                      )}
                    >
                      {tool.icon ? (
                        <tool.icon size={16} />
                      ) : (
                        tool.title.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-foreground truncate uppercase group-hover/row:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-[10px] text-foreground/30 font-medium truncate uppercase tracking-tighter">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <Badge
                      variant="outline"
                      className="hidden sm:inline-flex bg-background/50 border-foreground/5 text-[7px] font-black uppercase tracking-widest text-foreground/20"
                    >
                      {tool.category}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-foreground/10 group-hover:text-primary transition-all group-hover/row:translate-x-1" />
                  </div>
                </div>
              )}
            </a>
          ))}
        </div>

        <section className="mx-auto mt-24 w-full max-w-5xl border-t border-border pt-14">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
              FAQ
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Questions, answered
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Short answers so you can pick a tool and start.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_50px_-24px_rgba(56,189,248,0.35)]">
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-400/15 blur-2xl transition group-hover:bg-emerald-400/25" />
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/25">
                <CircleDollarSign className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                Are the tools free?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Yes. Every tool on this page is free to use in your browser.
              </p>
            </article>

            <article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_50px_-24px_rgba(56,189,248,0.35)]">
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sky-400/15 blur-2xl transition group-hover:bg-sky-400/25" />
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 ring-1 ring-sky-400/25">
                <UserRound className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                Do I need an account?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                No signup. Open a tool and start. Nothing extra to install.
              </p>
            </article>

            <article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_50px_-24px_rgba(56,189,248,0.35)]">
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-400/15 blur-2xl transition group-hover:bg-violet-400/25" />
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 ring-1 ring-violet-400/25">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                How do I start?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Search the tool name, tap a category, then open the card.
              </p>
            </article>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          @apply bg-transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          @apply bg-primary/20 rounded-full;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default function AllToolsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      }
    >
      <AllToolsPageContent />
    </Suspense>
  );
}
