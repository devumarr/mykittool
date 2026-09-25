"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Upload,
  Download,
  Trash2,
  Loader2,
  Info,
  FileText,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";

type Format = "image/png" | "image/jpeg" | "image/webp" | "application/pdf";

const FORMATS: { id: Format; label: string }[] = [
  { id: "image/png", label: "PNG" },
  { id: "image/jpeg", label: "JPG" },
  { id: "image/webp", label: "WebP" },
  { id: "application/pdf", label: "PDF" },
];

export default function ImageToFilePage() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [out, setOut] = useState<string | null>(null);
  const [name, setName] = useState("image");
  const [format, setFormat] = useState<Format>("image/png");
  const [quality, setQuality] = useState(90);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    return () => {
      if (out?.startsWith("blob:")) URL.revokeObjectURL(out);
    };
  }, [out]);

  const loadFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Image only" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSrc(String(reader.result));
      setName(file.name.replace(/\.[^.]+$/, ""));
      if (out?.startsWith("blob:")) URL.revokeObjectURL(out);
      setOut(null);
    };
    reader.readAsDataURL(file);
  };

  const convert = () => {
    if (!src) return;
    setBusy(true);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("canvas");
        if (format === "image/jpeg" || format === "application/pdf") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);

        if (format === "application/pdf") {
          const pdf = new jsPDF({
            orientation: img.width > img.height ? "l" : "p",
            unit: "px",
            format: [img.width, img.height],
          });
          pdf.addImage(
            canvas.toDataURL("image/jpeg", quality / 100),
            "JPEG",
            0,
            0,
            img.width,
            img.height,
          );
          const blob = pdf.output("blob");
          if (out?.startsWith("blob:")) URL.revokeObjectURL(out);
          setOut(URL.createObjectURL(blob));
        } else {
          let data = canvas.toDataURL(format, quality / 100);
          if (format === "image/webp" && !data.startsWith("data:image/webp")) {
            toast({ title: "WebP not supported", description: "Saved as PNG" });
            data = canvas.toDataURL("image/png");
          }
          setOut(data);
        }
        toast({ title: "Converted" });
      } catch {
        toast({ variant: "destructive", title: "Convert failed" });
      } finally {
        setBusy(false);
      }
    };
    img.onerror = () => {
      setBusy(false);
      toast({ variant: "destructive", title: "Could not read image" });
    };
    img.src = src;
  };

  const download = () => {
    if (!out) return;
    const ext =
      format === "application/pdf"
        ? "pdf"
        : format === "image/jpeg"
          ? "jpg"
          : format === "image/webp"
            ? "webp"
            : "png";
    const a = document.createElement("a");
    a.href = out;
    a.download = name + "." + ext;
    a.click();
  };

  const showQuality = format !== "image/png";

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
          Image tools
        </p>
        <h1 className="text-3xl font-black tracking-tight md:text-5xl">
          Image to File
        </h1>
        <p className="mt-3 max-w-xl text-sm text-foreground/60">
          Convert an image to PNG, JPG, WebP or PDF on this device.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-5">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle className="text-sm">Convert</CardTitle>
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
                const f = e.dataTransfer.files?.[0];
                if (f) loadFile(f);
              }}
              className={cn(
                "flex h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed",
                drag
                  ? "border-blue-600 bg-blue-600/5"
                  : "border-border bg-muted/30",
              )}
            >
              <Upload className="mb-2 h-7 w-7 text-blue-600" />
              <p className="text-sm font-semibold">
                {src ? name : "Drop or choose image"}
              </p>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) loadFile(f);
                e.target.value = "";
              }}
            />
            <div className="grid grid-cols-4 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id)}
                  className={cn(
                    "rounded-xl border py-2 text-xs font-bold",
                    format === f.id
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-border bg-muted/30",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {showQuality && (
              <div>
                <p className="mb-2 text-xs font-bold text-foreground/60">
                  Quality {quality}%
                </p>
                <Slider
                  value={[quality]}
                  min={10}
                  max={100}
                  step={1}
                  onValueChange={(v) => setQuality(v[0])}
                />
              </div>
            )}
            <Button
              onClick={convert}
              disabled={!src || busy}
              className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="mr-2 h-4 w-4" />
              )}
              Convert
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl"
              onClick={() => {
                if (out?.startsWith("blob:")) URL.revokeObjectURL(out);
                setSrc(null);
                setOut(null);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-7">
          <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-400" />
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle className="text-sm">Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex min-h-[280px] items-center justify-center rounded-2xl bg-muted/30 p-4">
              {out && format !== "application/pdf" ? (
                <img
                  src={out}
                  alt="Result"
                  className="max-h-[320px] object-contain"
                />
              ) : out && format === "application/pdf" ? (
                <div className="text-center">
                  <FileText className="mx-auto mb-2 h-12 w-12 text-blue-600" />
                  <p className="text-sm font-semibold">PDF ready</p>
                </div>
              ) : src ? (
                <img
                  src={src}
                  alt="Source"
                  className="max-h-[320px] object-contain"
                />
              ) : (
                <p className="text-sm text-foreground/45">No image yet</p>
              )}
            </div>
            {out && (
              <Button
                onClick={download}
                className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            )}
            <div className="flex gap-2 text-sm text-foreground/60">
              <Info className="h-4 w-4 shrink-0 text-blue-600" />
              Conversion stays in the browser. JPG and PDF use a white
              background.
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
            <h2 className="text-xl font-bold">Image to File FAQ</h2>
            <p className="text-sm text-foreground/55">How conversion works</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            {
              q: "Which formats can I export?",
              a: "PNG, JPG, WebP and PDF. Pick a format, convert, then download.",
            },
            {
              q: "Is the image uploaded?",
              a: "No. Conversion runs in your browser. The file stays on your device.",
            },
            {
              q: "Why is JPG on a white background?",
              a: "JPG does not support transparency. Transparent PNG areas become white.",
            },
            {
              q: "Is Image to File free?",
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
