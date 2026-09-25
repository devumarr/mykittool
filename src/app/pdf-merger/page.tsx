"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FileStack,
  Upload,
  Download,
  Trash2,
  Loader2,
  Info,
  CheckCircle2,
  FileText,
  ArrowUp,
  ArrowDown,
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

type Item = { id: string; file: File; name: string; size: number };

function formatSize(n: number) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / (1024 * 1024)).toFixed(2) + " MB";
}

export default function PdfMergerPage() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  const addFiles = (list: FileList | File[]) => {
    const pdfs = Array.from(list).filter(
      (f) =>
        f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    if (!pdfs.length) {
      toast({ variant: "destructive", title: "PDF files only" });
      return;
    }
    setFiles((prev) => [
      ...prev,
      ...pdfs.map((file) => ({
        id: file.name + "-" + file.size + "-" + Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
      })),
    ]);
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= files.length) return;
    const copy = [...files];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    setFiles(copy);
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
  };

  const mergeNow = async () => {
    if (files.length < 2) {
      toast({ variant: "destructive", title: "Add at least 2 PDFs" });
      return;
    }
    setBusy(true);
    setProgress(5);
    try {
      const out = await PDFDocument.create();
      let ok = 0;
      for (let i = 0; i < files.length; i++) {
        try {
          const src = await PDFDocument.load(
            await files[i].file.arrayBuffer(),
            {
              ignoreEncryption: true,
            },
          );
          const pages = await out.copyPages(src, src.getPageIndices());
          pages.forEach((p) => out.addPage(p));
          ok++;
        } catch {
          toast({
            variant: "destructive",
            title: "Skipped " + files[i].name,
          });
        }
        setProgress(Math.round(((i + 1) / files.length) * 90));
      }
      if (ok === 0) throw new Error("none");
      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      if (url) URL.revokeObjectURL(url);
      setUrl(URL.createObjectURL(blob));
      setProgress(100);
      toast({ title: "Merged", description: ok + " PDF(s) combined" });
    } catch {
      toast({ variant: "destructive", title: "Merge failed" });
    } finally {
      setBusy(false);
    }
  };

  const total = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
          PDF tools
        </p>
        <h1 className="text-3xl font-black tracking-tight md:text-5xl">
          PDF Merger
        </h1>
        <p className="mt-3 max-w-xl text-sm text-foreground/60">
          Combine PDFs in order. Reorder, then download one file.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-7">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
          <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/40">
            <CardTitle className="flex items-center gap-3 text-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                <FileStack className="h-4 w-4" />
              </span>
              Files
            </CardTitle>
            <span className="text-xs font-bold text-blue-600">
              {files.length}
            </span>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <button
              type="button"
              onClick={() => !busy && inputRef.current?.click()}
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
                "flex h-32 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed",
                drag
                  ? "border-blue-600 bg-blue-600/5"
                  : "border-border bg-muted/30 hover:border-blue-600/40",
              )}
            >
              <Upload className="mb-2 h-7 w-7 text-blue-600" />
              <p className="text-sm font-semibold">Drop PDFs or click</p>
            </button>
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

            {files.length > 0 && (
              <div className="max-h-[380px] space-y-2 overflow-auto">
                {files.map((f, i) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-3"
                  >
                    <span className="w-6 text-xs font-bold text-foreground/40">
                      {i + 1}
                    </span>
                    <FileText className="h-4 w-4 shrink-0 text-blue-600" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{f.name}</p>
                      <p className="text-xs text-foreground/50">
                        {formatSize(f.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={i === files.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setFiles((p) => p.filter((x) => x.id !== f.id))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-5">
          <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-400" />
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle className="text-sm">Merge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-foreground/60">
              Total size {formatSize(total)}
            </p>
            {busy && <Progress value={progress} className="h-2" />}
            <Button
              onClick={mergeNow}
              disabled={files.length < 2 || busy}
              className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Merge PDFs
            </Button>
            {url && (
              <Button
                asChild
                className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                <a href={url} download="merged.pdf">
                  <Download className="mr-2 h-4 w-4" /> Download
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                if (url) URL.revokeObjectURL(url);
                setFiles([]);
                setUrl(null);
                setProgress(0);
              }}
              className="h-12 w-full rounded-xl"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
            {url && (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Ready
              </div>
            )}
            <div className="flex gap-2 text-sm text-foreground/60">
              <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
              Merge runs on this device. Broken files are skipped.
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
            <h2 className="text-xl font-bold">PDF Merger FAQ</h2>
            <p className="text-sm text-foreground/55">How merge works</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            {
              q: "How many PDFs can I merge?",
              a: "Add two or more PDF files, set the order with the arrows, then merge.",
            },
            {
              q: "Is my file uploaded?",
              a: "No. Merging runs in your browser. Files stay on your device.",
            },
            {
              q: "What if one PDF is broken?",
              a: "That file is skipped. The rest are still merged.",
            },
            {
              q: "Is PDF Merger free?",
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
