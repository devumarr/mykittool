"use client";

import React, { useRef, useState } from "react";
import {
  FileArchive,
  Upload,
  Download,
  Trash2,
  Loader2,
  Info,
  CheckCircle2,
  FileText,
  X,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

type Level = "low" | "medium" | "high";
type Item = {
  id: string;
  file: File;
  status: "idle" | "working" | "done" | "error";
  original: number;
  result: number | null;
  url: string | null;
  blob: Blob | null;
};

function formatSize(n: number) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / (1024 * 1024)).toFixed(2) + " MB";
}

export default function PdfCompressorPage() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [level, setLevel] = useState<Level>("medium");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);

  const addFiles = (list: FileList | File[]) => {
    const files = Array.from(list).filter(
      (f) =>
        f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    if (!files.length) {
      toast({ variant: "destructive", title: "PDF only" });
      return;
    }
    setItems((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: file.name + "-" + file.size + "-" + Date.now() + Math.random(),
        file,
        status: "idle" as const,
        original: file.size,
        result: null,
        url: null,
        blob: null,
      })),
    ]);
  };

  const compressOne = async (item: Item): Promise<Partial<Item>> => {
    try {
      const src = await PDFDocument.load(await item.file.arrayBuffer(), {
        ignoreEncryption: true,
      });
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach((p) => out.addPage(p));
      if (level !== "low") {
        out.setTitle("");
        out.setAuthor("");
        out.setSubject("");
        out.setKeywords([]);
        out.setProducer("My Kit Tool");
        out.setCreator("My Kit Tool");
      }
      const bytes = await out.save({
        useObjectStreams: level !== "low",
        addDefaultPage: false,
      });
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const finalBlob = blob.size >= item.original ? item.file : blob;
      return {
        status: "done",
        blob: finalBlob,
        result: finalBlob.size,
        url: URL.createObjectURL(finalBlob),
      };
    } catch {
      return { status: "error" };
    }
  };

  const run = async () => {
    if (!items.length) return;
    setBusy(true);
    const next = [...items];
    for (let i = 0; i < next.length; i++) {
      if (next[i].status === "done") continue;
      next[i] = { ...next[i], status: "working" };
      setItems([...next]);
      if (next[i].url) URL.revokeObjectURL(next[i].url as string);
      next[i] = { ...next[i], ...(await compressOne(next[i])) };
      setProgress(Math.round(((i + 1) / next.length) * 100));
      setItems([...next]);
    }
    setBusy(false);
    toast({ title: "Compressed", description: "Ready to download" });
  };

  const downloadAll = async () => {
    const ready = items.filter((i) => i.status === "done" && i.blob);
    if (!ready.length) return;
    if (ready.length === 1) {
      const a = document.createElement("a");
      a.href = ready[0].url!;
      a.download = "compressed_" + ready[0].file.name;
      a.click();
      return;
    }
    const zip = new JSZip();
    ready.forEach((i) => zip.file("compressed_" + i.file.name, i.blob!));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed_pdfs.zip";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const orig = items.reduce((s, i) => s + i.original, 0);
  const after = items.reduce((s, i) => s + (i.result ?? i.original), 0);
  const saved =
    orig > 0 ? Math.max(0, Math.round((1 - after / orig) * 100)) : 0;
  const done = items.filter((i) => i.status === "done").length;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
          PDF tools
        </p>
        <h1 className="text-3xl font-black tracking-tight md:text-5xl">
          PDF Compressor
        </h1>
        <p className="mt-3 max-w-xl text-sm text-foreground/60">
          Compress PDFs privately in the browser. Multiple files supported.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-7">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
          <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/40">
            <CardTitle className="flex items-center gap-3 text-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                <FileText className="h-4 w-4" />
              </span>
              Your files
            </CardTitle>
            {items.length > 0 && (
              <span className="rounded-full bg-blue-600/10 px-3 py-1 text-[11px] font-bold text-blue-600">
                {items.length}
              </span>
            )}
          </CardHeader>
          <CardContent className="p-6">
            {!items.length ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  addFiles(e.dataTransfer.files);
                }}
                className={cn(
                  "flex h-52 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/30 transition",
                  drag
                    ? "border-blue-600 bg-blue-600/5"
                    : "border-border hover:border-blue-600/40",
                )}
              >
                <Upload className="mb-3 h-8 w-8 text-blue-600" />
                <p className="text-sm font-semibold">
                  Drop PDFs or click to upload
                </p>
                <p className="mt-1 text-xs text-foreground/45">
                  Multiple files allowed
                </p>
              </button>
            ) : (
              <div className="max-h-[420px] space-y-2 overflow-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-foreground/50">
                        {formatSize(item.original)}
                        {item.result != null && (
                          <span className="text-blue-600">
                            {" "}
                            → {formatSize(item.result)}
                          </span>
                        )}
                      </p>
                    </div>
                    {item.status === "working" && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                    {item.status === "done" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (item.url) URL.revokeObjectURL(item.url);
                        setItems((p) => p.filter((x) => x.id !== item.id));
                      }}
                      className="rounded-lg p-1 hover:bg-muted"
                    >
                      <X className="h-4 w-4 text-foreground/40" />
                    </button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  onClick={() => inputRef.current?.click()}
                  className="w-full rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add more
                </Button>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-5">
          <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl">
            <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-400" />
            <CardHeader className="border-b border-border bg-muted/40">
              <CardTitle className="text-sm">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLevel(id)}
                    className={cn(
                      "rounded-xl border py-3 text-xs font-bold capitalize",
                      level === id
                        ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "border-border bg-muted/30 hover:border-blue-600/30",
                    )}
                  >
                    {id}
                  </button>
                ))}
              </div>
              {busy && <Progress value={progress} className="h-2" />}
              <Button
                onClick={run}
                disabled={!items.length || busy}
                className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileArchive className="mr-2 h-4 w-4" />
                )}
                Compress
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  items.forEach((i) => i.url && URL.revokeObjectURL(i.url));
                  setItems([]);
                  setProgress(0);
                }}
                className="h-12 w-full rounded-xl"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Clear
              </Button>
            </CardContent>
          </Card>

          {done > 0 && (
            <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl">
              <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-400" />
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-muted/40 p-4">
                    <p className="text-[11px] text-foreground/50">Before</p>
                    <p className="text-sm font-bold">{formatSize(orig)}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-600/10 p-4">
                    <p className="text-[11px] text-blue-600">After</p>
                    <p className="text-sm font-bold text-blue-600">
                      {formatSize(after)}
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-black text-blue-600">
                  {saved}% smaller
                </p>
                <Button
                  onClick={downloadAll}
                  className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {done > 1 ? "Download ZIP" : "Download PDF"}
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <p className="text-sm text-foreground/60">
              Compression stays on this device. Image-heavy PDFs may not shrink
              much.
            </p>
          </div>
        </div>
      </div>
      <section className="mx-auto mt-16 max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold">PDF Compressor FAQ</h2>
            <p className="text-sm text-foreground/55">How compression works</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            {
              q: "Is PDF Compressor free?",
              a: "Yes. Compress PDFs on My Kit Tool at no cost.",
            },
            {
              q: "Do you upload my PDF?",
              a: "No. Compression runs in your browser. The file stays on your device.",
            },
            {
              q: "Can I compress more than one PDF?",
              a: "Yes. Add multiple files and download a ZIP when more than one is ready.",
            },
            {
              q: "Why did my file stay the same size?",
              a: "If a rebuild is larger, the original is kept. Image-heavy PDFs often cannot shrink much in the browser.",
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
