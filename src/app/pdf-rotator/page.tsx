"use client";

import React, { useRef, useState } from "react";
import {
  RotateCcw,
  RotateCw,
  Upload,
  Download,
  Trash2,
  Loader2,
  Info,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PDFDocument, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

type PageData = {
  index: number;
  rotation: number;
  thumbnail: string;
};

function wrap(n: number) {
  return ((n % 360) + 360) % 360;
}

export default function PdfRotatorPage() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);

  const loadPdf = async (selected: File) => {
    if (
      !selected.type.includes("pdf") &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      toast({ variant: "destructive", title: "PDF only" });
      return;
    }
    setLoading(true);
    setProgress(0);
    setPages([]);
    try {
      const data = await selected.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(data) })
        .promise;
      const loaded: PageData[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.35 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        loaded.push({
          index: i,
          rotation: 0,
          thumbnail: canvas.toDataURL("image/jpeg", 0.7),
        });
        setProgress(Math.round((i / pdf.numPages) * 100));
      }
      setPages(loaded);
      setFile(selected);
      toast({ title: "Loaded", description: loaded.length + " pages" });
    } catch {
      toast({ variant: "destructive", title: "Could not read PDF" });
    } finally {
      setLoading(false);
    }
  };

  const rotateOne = (index: number, d: number) => {
    setPages((p) =>
      p.map((x) =>
        x.index === index ? { ...x, rotation: wrap(x.rotation + d) } : x,
      ),
    );
  };

  const rotateAll = (d: number) => {
    setPages((p) => p.map((x) => ({ ...x, rotation: wrap(x.rotation + d) })));
  };

  const savePdf = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer(), {
        ignoreEncryption: true,
      });
      const pdfPages = doc.getPages();
      pages.forEach((p, i) => {
        if (!pdfPages[i] || p.rotation === 0) return;
        const cur = pdfPages[i].getRotation().angle;
        pdfPages[i].setRotation(degrees(wrap(cur + p.rotation)));
      });
      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rotated_" + file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      toast({ title: "Downloaded" });
    } catch {
      toast({ variant: "destructive", title: "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
          PDF tools
        </p>
        <h1 className="text-3xl font-black tracking-tight md:text-5xl">
          PDF Rotator
        </h1>
        <p className="mt-3 max-w-xl text-sm text-foreground/60">
          Rotate pages left or right, then download. Files stay on this device.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-4">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle className="text-sm">File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <button
              type="button"
              onClick={() => !loading && inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                const f = e.dataTransfer.files?.[0];
                if (f) loadPdf(f);
              }}
              className={cn(
                "flex h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed",
                drag
                  ? "border-blue-600 bg-blue-600/5"
                  : "border-border bg-muted/30",
              )}
            >
              {loading ? (
                <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              ) : (
                <Upload className="mb-2 h-7 w-7 text-blue-600" />
              )}
              <p className="text-sm font-semibold">
                {file ? file.name : "Drop or choose PDF"}
              </p>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) loadPdf(f);
                e.target.value = "";
              }}
            />
            {loading && <Progress value={progress} className="h-2" />}
            {file && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => rotateAll(-90)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> All left
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => rotateAll(90)}
                  >
                    <RotateCw className="mr-2 h-4 w-4" /> All right
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setPages((p) => p.map((x) => ({ ...x, rotation: 0 })))
                  }
                  className="w-full"
                >
                  Reset rotation
                </Button>
                <Button
                  onClick={savePdf}
                  disabled={saving}
                  className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-xl"
                  onClick={() => {
                    setFile(null);
                    setPages([]);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
              </>
            )}
            <div className="flex gap-2 text-sm text-foreground/60">
              <Info className="h-4 w-4 shrink-0 text-blue-600" />
              Rotation is saved into the PDF, not only the preview.
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-8">
          <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-400" />
          <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/40">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-blue-600" /> Pages
            </CardTitle>
            {pages.length > 0 && (
              <span className="text-xs font-bold text-blue-600">
                {pages.length}
              </span>
            )}
          </CardHeader>
          <CardContent className="p-6">
            {!pages.length ? (
              <p className="py-20 text-center text-sm text-foreground/45">
                Upload a PDF to see pages
              </p>
            ) : (
              <div className="grid max-h-[640px] grid-cols-2 gap-4 overflow-auto sm:grid-cols-3">
                {pages.map((p) => (
                  <div
                    key={p.index}
                    className="rounded-2xl border border-border bg-muted/20 p-3"
                  >
                    <div className="relative mb-3 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-white">
                      {p.rotation !== 0 && (
                        <CheckCircle2 className="absolute right-2 top-2 z-10 h-4 w-4 text-blue-600" />
                      )}
                      <img
                        src={p.thumbnail}
                        alt={"Page " + p.index}
                        className="max-h-full max-w-full object-contain"
                        style={{ transform: `rotate(${p.rotation}deg)` }}
                      />
                    </div>
                    <p className="mb-2 text-center text-xs font-bold">
                      Page {p.index} · {p.rotation}°
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => rotateOne(p.index, -90)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => rotateOne(p.index, 90)}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="mx-auto mt-16 max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold">PDF Rotator FAQ</h2>
            <p className="text-sm text-foreground/55">How rotation works</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            {
              q: "Can I rotate one page only?",
              a: "Yes. Use the arrows under each page. Use All left or All right for every page.",
            },
            {
              q: "Is the file uploaded?",
              a: "No. Rotation runs in your browser. The PDF stays on your device.",
            },
            {
              q: "Does download keep the new angle?",
              a: "Yes. The saved PDF includes the rotation, not only the preview.",
            },
            {
              q: "Is PDF Rotator free?",
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
