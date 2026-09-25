"use client";

import React, { useRef, useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Loader2,
  Info,
  FileImage,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";

type Item = {
  id: string;
  src: string;
  name: string;
  size: number;
  width: number;
  height: number;
};
type Mode = "fit" | "a4" | "original";

function pageSize(img: Item, mode: Mode) {
  if (mode === "a4") {
    const a4w = 595;
    const a4h = 842;
    const landscape = img.width > img.height;
    const W = landscape ? a4h : a4w;
    const H = landscape ? a4w : a4h;
    const r = Math.min((W - 24) / img.width, (H - 24) / img.height);
    return {
      pageW: W,
      pageH: H,
      w: img.width * r,
      h: img.height * r,
      x: (W - img.width * r) / 2,
      y: (H - img.height * r) / 2,
    };
  }
  const w = mode === "fit" ? 600 : img.width;
  const h = (img.height / img.width) * w;
  return { pageW: w, pageH: h, w, h, x: 0, y: 0 };
}

export default function ImageToPdfPage() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<Mode>("a4");
  const [drag, setDrag] = useState(false);

  const addFiles = async (list: FileList | File[]) => {
    const files = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (!files.length) {
      toast({ variant: "destructive", title: "Images only" });
      return;
    }
    setBusy(true);
    const next: Item[] = [];
    for (const file of files) {
      const src = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const el = new Image();
        el.onload = () => res(el);
        el.onerror = rej;
        el.src = src;
      });
      next.push({
        id: file.name + "-" + file.size + "-" + Date.now() + Math.random(),
        src,
        name: file.name,
        size: file.size,
        width: img.width,
        height: img.height,
      });
    }
    setImages((p) => [...p, ...next]);
    setBusy(false);
  };

  const convert = async () => {
    if (!images.length) return;
    setBusy(true);
    setProgress(0);
    try {
      const first = pageSize(images[0], mode);
      const pdf = new jsPDF({
        orientation: first.pageW > first.pageH ? "l" : "p",
        unit: "px",
        format: [first.pageW, first.pageH],
        compress: true,
      });
      for (let i = 0; i < images.length; i++) {
        const s = pageSize(images[i], mode);
        if (i > 0)
          pdf.addPage([s.pageW, s.pageH], s.pageW > s.pageH ? "l" : "p");
        const type = images[i].name.toLowerCase().endsWith(".png")
          ? "PNG"
          : "JPEG";
        pdf.addImage(images[i].src, type, s.x, s.y, s.w, s.h);
        setProgress(Math.round(((i + 1) / images.length) * 100));
      }
      pdf.save("images.pdf");
      toast({ title: "PDF ready" });
    } catch {
      toast({ variant: "destructive", title: "Convert failed" });
    } finally {
      setBusy(false);
    }
  };

  const move = (i: number, d: -1 | 1) => {
    const n = i + d;
    if (n < 0 || n >= images.length) return;
    const copy = [...images];
    [copy[i], copy[n]] = [copy[n], copy[i]];
    setImages(copy);
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
          PDF tools
        </p>
        <h1 className="text-3xl font-black tracking-tight md:text-5xl">
          Image to PDF
        </h1>
        <p className="mt-3 max-w-xl text-sm text-foreground/60">
          Combine photos into one PDF. Reorder first, then convert.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-7">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle className="flex items-center gap-3 text-sm">
              <FileImage className="h-4 w-4 text-blue-600" /> Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
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
                "flex h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed",
                drag
                  ? "border-blue-600 bg-blue-600/5"
                  : "border-border bg-muted/30",
              )}
            >
              <Upload className="mb-2 h-7 w-7 text-blue-600" />
              <p className="text-sm font-semibold">Drop images or click</p>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            {images.length > 0 && (
              <div className="max-h-[380px] space-y-2 overflow-auto">
                {images.map((img, i) => (
                  <div
                    key={img.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-background p-2"
                  >
                    <img
                      src={img.src}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {img.name}
                      </p>
                      <p className="text-xs text-foreground/50">
                        {img.width}×{img.height}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={i === images.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setImages((p) => p.filter((x) => x.id !== img.id))
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
            <CardTitle className="text-sm">Convert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-3 gap-2">
              {(["a4", "fit", "original"] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={cn(
                    "rounded-xl border py-3 text-xs font-bold capitalize",
                    mode === id
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-border bg-muted/30",
                  )}
                >
                  {id}
                </button>
              ))}
            </div>
            {busy && progress > 0 && (
              <Progress value={progress} className="h-2" />
            )}
            <Button
              onClick={convert}
              disabled={!images.length || busy}
              className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Create PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => setImages([])}
              className="h-12 w-full rounded-xl"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
            <div className="flex gap-2 text-sm text-foreground/60">
              <Info className="h-4 w-4 shrink-0 text-blue-600" />
              Conversion stays on this device. A4 keeps margins.
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
            <h2 className="text-xl font-bold">Image to PDF FAQ</h2>
            <p className="text-sm text-foreground/55">How conversion works</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            {
              q: "Which images can I convert?",
              a: "JPG, PNG, WebP and other common image files. Add more than one and reorder them.",
            },
            {
              q: "Do you upload my photos?",
              a: "No. The PDF is built in your browser. Images stay on your device.",
            },
            {
              q: "What is A4 vs Fit vs Original?",
              a: "A4 uses a standard page with margins. Fit scales to a fixed width. Original keeps the photo size.",
            },
            {
              q: "Is Image to PDF free?",
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
