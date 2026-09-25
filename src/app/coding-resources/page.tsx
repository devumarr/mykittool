"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ExternalLink,
  RefreshCcw,
  Loader2,
  AlertCircle,
  BookOpen,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Resource = {
  id: number | string;
  description: string;
  url: string;
  types?: string[];
  topics?: string[];
};

const FALLBACK: Resource[] = [
  {
    id: "mdn",
    description: "MDN Web Docs",
    url: "https://developer.mozilla.org/",
    topics: ["javascript", "html", "css"],
    types: ["docs"],
  },
];

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export default function CodingResourcesPage() {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("all");
  const [topicQ, setTopicQ] = useState("");
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<"asc" | "desc">("asc");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 12000);
      const res = await fetch(
        "https://api.sampleapis.com/codingresources/codingResources",
        { signal: ctrl.signal },
      );
      clearTimeout(t);
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      const list: Resource[] = Array.isArray(data)
        ? data.filter((r) => r && r.url && r.description)
        : [];
      setResources(list.length ? list : FALLBACK);
    } catch {
      setResources(FALLBACK);
      setError("Live list failed. Showing saved resources.");
      toast({ title: "Using backup list" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const topics = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((r) => (r.topics || []).forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  const topicList = useMemo(() => {
    const n = norm(topicQ);
    return topics.filter((t) => !n || norm(t).includes(n));
  }, [topics, topicQ]);

  const shown = useMemo(() => {
    const nq = norm(q);
    const list = resources.filter((r) => {
      const hay = norm(
        [r.description, r.url, ...(r.topics || []), ...(r.types || [])].join(
          " ",
        ),
      );
      const okSearch = !nq || nq.split(" ").every((w) => hay.includes(w));
      const okTopic = topic === "all" || (r.topics || []).includes(topic);
      return okSearch && okTopic;
    });
    list.sort((a, b) =>
      sort === "asc"
        ? a.description.localeCompare(b.description)
        : b.description.localeCompare(a.description),
    );
    return list;
  }, [resources, q, topic, sort]);

  const pick = (value: string) => {
    setTopic(value);
    setOpen(false);
    setTopicQ("");
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
            Developer tools
          </p>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">
            Coding Resources
          </h1>
          <p className="mt-3 max-w-xl text-sm text-foreground/60">
            Search docs and learning links. Filter by topic.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={load}
          disabled={loading}
          className="rounded-xl"
        >
          <RefreshCcw
            className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      <Card className="mb-6 overflow-hidden rounded-[1.8rem] border border-border shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
        <CardHeader className="border-b border-border bg-muted/30">
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5 md:p-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search React, CSS..."
              className="h-12 rounded-xl pl-9"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-foreground/55">Topic</p>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-background px-3 text-left text-sm"
            >
              <span className="truncate capitalize">
                {topic === "all" ? "All topics" : topic}
              </span>
              <ChevronDown
                className={cn("h-4 w-4 shrink-0", open && "rotate-180")}
              />
            </button>

            {open && (
              <div className="mt-2 rounded-2xl border border-border">
                <div className="p-2">
                  <Input
                    value={topicQ}
                    onChange={(e) => setTopicQ(e.target.value)}
                    placeholder="Find topic..."
                    className="h-10 rounded-xl"
                    autoFocus
                  />
                </div>
                <div className="h-[168px] overflow-y-auto px-1 pb-2">
                  <button
                    type="button"
                    onClick={() => pick("all")}
                    className="flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-sm hover:bg-muted"
                  >
                    All topics
                    {topic === "all" && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                  {topicList.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => pick(t)}
                      className="flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-sm capitalize hover:bg-muted"
                    >
                      <span className="truncate pr-2">{t}</span>
                      {topic === t && (
                        <Check className="h-4 w-4 shrink-0 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {topic !== "all" && (
              <button
                type="button"
                onClick={() => setTopic("all")}
                className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-600/10 px-2 py-1 text-[11px] font-bold text-blue-600"
              >
                {topic} <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSort("asc")}
              className={cn(
                "rounded-xl border py-2 text-xs font-bold",
                sort === "asc"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-border bg-background",
              )}
            >
              A–Z
            </button>
            <button
              type="button"
              onClick={() => setSort("desc")}
              className={cn(
                "rounded-xl border py-2 text-xs font-bold",
                sort === "desc"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-border bg-background",
              )}
            >
              Z–A
            </button>
          </div>
          <p className="text-xs font-bold text-blue-600">
            {shown.length} results
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {error && (
            <p className="mb-4 flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" /> {error}
            </p>
          )}
          {shown.length === 0 ? (
            <p className="py-16 text-center text-sm text-foreground/50">
              No matches
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {shown.map((r) => (
                <Card
                  key={String(r.id) + r.url}
                  className="overflow-hidden rounded-2xl border border-border shadow-sm"
                >
                  <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-orange-400" />
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                        <BookOpen className="h-4 w-4" />
                      </span>
                      <h2 className="text-sm font-bold leading-snug">
                        {r.description}
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(r.topics || []).slice(0, 4).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTopic(t)}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <Button
                      asChild
                      className="h-10 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <a href={r.url} target="_blank" rel="noopener noreferrer">
                        Open <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      <section className="mx-auto mt-16 max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold">Coding Resources FAQ</h2>
            <p className="text-sm text-foreground/55">How this list works</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            {
              q: "Where do the links come from?",
              a: "The page loads a public coding resources list. If that fails, a small backup list is shown.",
            },
            {
              q: "Can I filter by topic?",
              a: "Yes. Open Topic, search a tag like React or Java, then pick it.",
            },
            {
              q: "Do you host the courses?",
              a: "No. Open sends you to the official site. We only list links.",
            },
            {
              q: "Is Coding Resources free?",
              a: "Yes. This tool on My Kit Tool is free.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
              <div className="p-5">
                <h3 className="text-sm font-bold">{item.q}</h3>
                <p className="mt-1 text-sm text-foreground/60">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
