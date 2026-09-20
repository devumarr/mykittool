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
            Search by name or type. Open a tool and start.
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
            <div className="w-auto overflow-x-auto no-scrollbar bg-foreground/[0.02] backdrop-blur-3xl border border-foreground/5 rounded-2xl p-1.5 shadow-2xl">
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
                        "inline-flex h-9 w-9 items-center justify-center rounded-xl mb-4 shadow-inner border border-foreground/5 transition-all group-hover:scale-110",
                        tool.category === "AI"
                          ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                          : tool.category === "Image"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            : tool.category === "File"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
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
                        "flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-xl shadow-inner border border-foreground/5",
                        tool.category === "AI"
                          ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                          : tool.category === "Image"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            : tool.category === "File"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
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
