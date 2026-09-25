"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Scissors,
  Upload,
  Trash2,
  Loader2,
  Info,
  CheckCircle2,
  FileText,
  FileArchive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

type Mode = "pages" | "ranges" | "chunks";

function parseRanges(input: string, max: number): number[][] {
  const out: number[][] = [];
  input.split(",").forEach((raw) => {
    const part = raw.trim();
    if (!part) return;
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((n) => parseInt(n.trim(), 10));
      if (!Number.isFinite(a) || !Number.isFinite(b)) return;
      const from = Math.min(Math.max(1, a), max);
      const to = Math.min(Math.max(1, b), max);
      const lo = Math.min(from, to);
      const hi = Math.max(from, to);
      const pages: number[] = [];
      for (let n = lo; n <= hi; n++) pages.push(n - 1);
      if (pages.length) out.push(pages);
    } else {
      const n = parseInt(part, 10);
      if (Number.isFinite(n) && n >= 1 && n <= max) out.push([n - 1]);
    }
  });
  return out;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export default function PdfSplitterPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [mode, setMode] = useState<Mode>("pages");
  const [ranges, setRanges] = useState("1-2");
  const [chunkSize, setChunkSize] = useState(1);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const loadPdf = async (selectedFile: File) => {
    const pdf = await PDFDocument.load(await selectedFile.arrayBuffer(), {
      ignoreEncryption: true,
    });
    const count = pdf.getPageCount();
    setFile(selectedFile);
    setNumPages(count);
    setSelected(Array(count).fill(true));
    toast({ title: "PDF loaded", description: `${count} pages` });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      await loadPdf(f);
    } catch {
      toast({ variant: "destructive", title: "Could not read this PDF" });
    }
  };

  const jobs = useMemo(() => {
    if (!numPages) return [] as { name: string; pages: number[] }[];
    if (mode === "pages") {
      return selected
        .map((on, i) => (on ? { name: `page-${i + 1}`, pages: [i] } : null))
        .filter(Boolean) as { name: string; pages: number[] }[];
    }
    if (mode === "chunks") {
      const size = Math.max(1, Math.min(chunkSize || 1, numPages));
      const list: { name: string; pages: number[] }[] = [];
      for (let i = 0; i < numPages; i += size) {
        const end = Math.min(i + size, numPages);
        list.push({
          name: size === 1 ? `page-\( {i + 1}` : `pages- \){i + 1}-to-${end}`,
          pages: Array.from({ length: end - i }, (_, k) => i + k),
        });
      }
      return list;
    }
    return parseRanges(ranges, numPages).map((pages, idx) => ({
      name: pages.length === 1 ? `page-\( {pages[0] + 1}` : `part- \){idx + 1}`,
      pages,
    }));
  }, [numPages, selected, mode, ranges, chunkSize]);

  const splitNow = async () => {
    if (!file || !jobs.length) {
      toast({ variant: "destructive", title: "Select at least one page" });
      return;
    }
    setBusy(true);
    setProgress(8);
    try {
      const src = await PDFDocument.load(await file.arrayBuffer(), {
        ignoreEncryption: true,
      });
      const total = src.getPageCount();
      const base = file.name.replace(/\.pdf$/i, "") || "split";
      const zip = new JSZip();

      for (let i = 0; i < jobs.length; i++) {
        const pages = jobs[i].pages.filter((p) => p >= 0 && p < total);
        if (!pages.length) continue;
        const out = await PDFDocument.create();
        const copied = await out.copyPages(src, pages);
        copied.forEach((p) => out.addPage(p));
        const bytes = await out.save();
        zip.file(base + "_" + jobs[i].name + ".pdf", bytes);
        setProgress(10 + Math.round(((i + 1) / jobs.length) * 80));
      }

      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, `${base}_split.zip`);
      setProgress(100);
      toast({
        title: "ZIP ready",
        description: `${jobs.length} PDF file(s) inside the zip`,
      });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Split failed" });
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(0), 700);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
          PDF tools
        </p>
        <h1 className="text-3xl font-black tracking-tight md:text-5xl">
          PDF Splitter
        </h1>
        <p className="mt-3 max-w-xl text-sm text-foreground/60">
          pages → zip with PDFs. Or pick pages / ranges yourself.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-7">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle className="flex items-center gap-3 text-sm">
              <FileText className="h-4 w-4 text-blue-600" /> File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <button
              type="button"
              onClick={() => !busy && fileInputRef.current?.click()}
              className={cn(
                "flex h-32 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 hover:border-blue-600/40",
                file && "border-solid border-blue-600/20",
              )}
            >
              {file ? (
                <>
                  <CheckCircle2 className="mb-2 h-7 w-7 text-blue-600" />
                  <p className="max-w-[240px] truncate text-sm font-bold">
                    {file.name}
                  </p>
                  <p className="text-xs text-foreground/50">{numPages} pages</p>
                </>
              ) : (
                <>
                  <Upload className="mb-2 h-7 w-7 text-foreground/30" />
                  <p className="text-sm font-semibold">Choose a PDF</p>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFile}
            />

            {file && (
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["pages", "Each page"],
                    ["ranges", "Ranges"],
                    ["chunks", "Chunks"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMode(id)}
                    className={cn(
                      "rounded-xl border px-2 py-3 text-xs font-bold",
                      mode === id
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-border bg-muted/30",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {file && mode === "pages" && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <Label>Pages in ZIP</Label>
                  <button
                    type="button"
                    className="text-blue-600"
                    onClick={() =>
                      setSelected((s) => s.map(() => s.some((x) => !x)))
                    }
                  >
                    Toggle all
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {selected.map((on, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setSelected((s) =>
                          s.map((v, idx) => (idx === i ? !v : v)),
                        )
                      }
                      className={cn(
                        "rounded-xl border py-2 text-xs font-bold",
                        on
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-border bg-muted/30",
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {file && mode === "ranges" && (
              <div className="space-y-2">
                <Label>Example: 1-2, 4</Label>
                <Input
                  value={ranges}
                  onChange={(e) => setRanges(e.target.value)}
                  className="h-12 rounded-xl font-mono"
                />
              </div>
            )}

            {file && mode === "chunks" && (
              <div className="space-y-2">
                <Label>Pages per PDF (1 = one page each)</Label>
                <Input
                  type="number"
                  min={1}
                  max={Math.max(1, numPages)}
                  value={chunkSize}
                  onChange={(e) =>
                    setChunkSize(parseInt(e.target.value, 10) || 1)
                  }
                  className="h-12 rounded-xl"
                />
              </div>
            )}

            {busy && <Progress value={progress} className="h-2" />}

            <div className="flex gap-3">
              <Button
                onClick={splitNow}
                disabled={!file || !jobs.length || busy}
                className="h-12 flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Scissors className="mr-2 h-4 w-4" />
                )}
                Download ZIP ({jobs.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setNumPages(0);
                  setSelected([]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="h-12 w-12 rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-5">
          <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-400" />
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileArchive className="h-4 w-4 text-blue-600" /> Inside ZIP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            <div className="max-h-80 space-y-2 overflow-auto">
              {jobs.map((j, i) => (
                <div
                  key={i}
                  className="flex justify-between rounded-xl bg-muted/40 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{j.name}.pdf</span>
                  <span className="text-xs text-foreground/50">
                    {j.pages.length} page
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 text-sm text-foreground/60">
              <Info className="h-4 w-4 text-blue-600" />
              Each listed file is a separate PDF in the zip.
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="mx-auto mt-16 max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold">PDF Splitter FAQ</h2>
            <p className="text-sm text-foreground/55">How split works</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            {
              q: "What is inside the ZIP?",
              a: "Each selected page or range is its own PDF file inside the ZIP.",
            },
            {
              q: "Is my PDF uploaded?",
              a: "No. Splitting runs in your browser. The file stays on your device.",
            },
            {
              q: "Can I choose pages?",
              a: "Yes. Use Each page and tap the page numbers, or type ranges like 1-3, 5.",
            },
            {
              q: "Is PDF Splitter free?",
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
