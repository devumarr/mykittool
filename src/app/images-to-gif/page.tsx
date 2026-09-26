"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Film,
  Download,
  Trash2,
  Loader2,
  Plus,
  Clock,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GetHelp } from "@/components/mykittool/get-help";

type Frame = { id: string; src: string };
let seq = 0;

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image failed"));
    img.src = src;
  });
}

function squareFrame(img: HTMLImageElement, size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, size, size);
  const scale = Math.min(size / img.width, size / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);
  return ctx.getImageData(0, 0, size, size);
}

function palette216() {
  const p: number[] = [];
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 6; g++) {
      for (let b = 0; b < 6; b++) {
        p.push(
          Math.round((r * 255) / 5),
          Math.round((g * 255) / 5),
          Math.round((b * 255) / 5),
        );
      }
    }
  }
  while (p.length < 768) p.push(0);
  return p;
}

function toIndex(data: Uint8ClampedArray) {
  const out = new Uint8Array(data.length / 4);
  for (let i = 0, n = 0; i < data.length; i += 4, n++) {
    const r = Math.round((data[i] / 255) * 5);
    const g = Math.round((data[i + 1] / 255) * 5);
    const b = Math.round((data[i + 2] / 255) * 5);
    out[n] = r * 36 + g * 6 + b;
  }
  return out;
}

function uncompressedLzw(indexes: Uint8Array) {
  const CLEAR = 256;
  const END = 257;
  const out: number[] = [];
  let acc = 0;
  let bits = 0;
  const put = (code: number) => {
    acc |= code << bits;
    bits += 9;
    while (bits >= 8) {
      out.push(acc & 255);
      acc >>= 8;
      bits -= 8;
    }
  };
  put(CLEAR);
  let sinceClear = 0;
  for (let i = 0; i < indexes.length; i++) {
    if (sinceClear >= 120) {
      put(CLEAR);
      sinceClear = 0;
    }
    put(indexes[i]);
    sinceClear += 1;
  }
  put(END);
  if (bits) out.push(acc & 255);
  return new Uint8Array(out);
}

function subBlocks(bytes: Uint8Array) {
  const out: number[] = [];
  for (let i = 0; i < bytes.length; i += 255) {
    const n = Math.min(255, bytes.length - i);
    out.push(n);
    for (let j = 0; j < n; j++) out.push(bytes[i + j]);
  }
  out.push(0);
  return out;
}

function makeGif(frames: ImageData[], delayCs: number) {
  const size = frames[0].width;
  const pal = palette216();
  const bytes: number[] = [];
  const u16 = (n: number) => bytes.push(n & 255, (n >> 8) & 255);

  bytes.push(71, 73, 70, 56, 57, 97);
  u16(size);
  u16(size);
  bytes.push(0xf7, 0, 0);
  for (let i = 0; i < 768; i++) bytes.push(pal[i] || 0);

  bytes.push(
    33,
    255,
    11,
    78,
    69,
    84,
    83,
    67,
    65,
    80,
    69,
    50,
    46,
    48,
    3,
    1,
    0,
    0,
    0,
  );

  for (let f = 0; f < frames.length; f++) {
    const idx = toIndex(frames[f].data);
    bytes.push(33, 249, 4, 0, delayCs & 255, (delayCs >> 8) & 255, 0, 0);
    bytes.push(44);
    u16(0);
    u16(0);
    u16(size);
    u16(size);
    bytes.push(0);
    bytes.push(8);
    const packed = uncompressedLzw(idx);
    const blocks = subBlocks(packed);
    for (let i = 0; i < blocks.length; i++) bytes.push(blocks[i]);
  }
  bytes.push(59);
  return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
}

export default function ImagesToGifPage() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [delayMs, setDelayMs] = useState(400);
  const [size, setSize] = useState(320);
  const [preview, setPreview] = useState(0);
  const [gifUrl, setGifUrl] = useState("");

  useEffect(() => {
    return () => {
      if (gifUrl) URL.revokeObjectURL(gifUrl);
    };
  }, [gifUrl]);

  useEffect(() => {
    if (frames.length < 2 || busy || gifUrl) return;
    const t = window.setInterval(
      () => setPreview((i) => (i + 1) % frames.length),
      delayMs,
    );
    return () => window.clearInterval(t);
  }, [frames.length, delayMs, busy, gifUrl]);

  const addFiles = async (files: File[]) => {
    const images = files.filter((f) => f.type.indexOf("image/") === 0);
    if (!images.length) {
      toast({ variant: "destructive", title: "Choose image files" });
      return;
    }
    if (frames.length + images.length > 12) {
      toast({ variant: "destructive", title: "Max 12 images" });
      return;
    }
    const next: Frame[] = [];
    for (let i = 0; i < images.length; i++) {
      try {
        seq += 1;
        next.push({ id: "f-" + seq, src: await readFile(images[i]) });
      } catch {}
    }
    if (!next.length) return;
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    setGifUrl("");
    setFrames((old) => old.concat(next));
  };

  const moveFrame = (index: number, dir: number) => {
    const j = index + dir;
    if (j < 0 || j >= frames.length) return;
    const copy = frames.slice();
    const tmp = copy[index];
    copy[index] = copy[j];
    copy[j] = tmp;
    setFrames(copy);
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    setGifUrl("");
  };

  const createGif = async () => {
    if (frames.length < 2) {
      toast({ variant: "destructive", title: "Add at least 2 images" });
      return;
    }
    setBusy(true);
    setProgress(5);
    try {
      const data: ImageData[] = [];
      for (let i = 0; i < frames.length; i++) {
        const img = await loadImage(frames[i].src);
        data.push(squareFrame(img, size));
        setProgress(5 + Math.round(((i + 1) / frames.length) * 70));
        await new Promise((r) => setTimeout(r, 0));
      }
      const delayCs = Math.max(4, Math.round(delayMs / 10));
      const blob = makeGif(data, delayCs);
      if (gifUrl) URL.revokeObjectURL(gifUrl);
      const url = URL.createObjectURL(blob);
      setGifUrl(url);
      const a = document.createElement("a");
      a.href = url;
      a.download = "chat-gif-" + Date.now() + ".gif";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({ title: "Square GIF downloaded" });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "GIF failed",
        description: e instanceof Error ? e.message : "Try again",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
            Animation
          </p>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">
            Images to GIF
          </h1>
          <p className="mt-2 max-w-xl text-sm text-foreground/60">
            Square GIF so chat apps do not crop half the picture.
          </p>
        </div>
        <div className="flex gap-2">
          <GetHelp toolId="images-to-gif" />
          {frames.length > 0 && (
            <Button
              variant="outline"
              className="h-10 rounded-xl"
              onClick={() => {
                if (gifUrl) URL.revokeObjectURL(gifUrl);
                setGifUrl("");
                setFrames([]);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Reset
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <Card className="overflow-hidden rounded-[1.8rem] border border-border shadow-xl">
            <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Film className="h-4 w-4 text-blue-600" /> Preview
              </CardTitle>
              <span className="text-xs text-foreground/50">
                {frames.length} frames
              </span>
            </CardHeader>
            <CardContent className="relative flex min-h-[320px] items-center justify-center ">
              {gifUrl ? (
                <img
                  src={gifUrl}
                  alt="GIF"
                  className="h-[300px] w-[300px] object-contain"
                />
              ) : frames.length > 0 ? (
                <img
                  src={frames[Math.min(preview, frames.length - 1)].src}
                  alt=""
                  className="h-[300px] w-[300px] object-contain"
                />
              ) : (
                <div className="text-center text-sm ">
                  <ImageIcon className="mx-auto mb-2 h-10 w-10" />
                  Add 2 images
                </div>
              )}
              {busy && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                  <Progress value={progress} className="h-1 w-48" />
                </div>
              )}
            </CardContent>
          </Card>

          {frames.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {frames.map((frame, index) => (
                <div
                  key={frame.id}
                  className={cn(
                    "relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border",
                    preview === index ? "border-blue-600" : "border-border",
                  )}
                >
                  <img
                    src={frame.src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/55 py-1">
                    <button type="button" onClick={() => moveFrame(index, -1)}>
                      <ArrowLeft className="h-3 w-3 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFrames((old) =>
                          old.filter((x) => x.id !== frame.id),
                        );
                        if (gifUrl) URL.revokeObjectURL(gifUrl);
                        setGifUrl("");
                      }}
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                    <button type="button" onClick={() => moveFrame(index, 1)}>
                      <ArrowRight className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => inputRef.current && inputRef.current.click()}
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-dashed"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <Card className="overflow-hidden rounded-[1.8rem] border border-border lg:col-span-4">
          <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-400" />
          <CardHeader>
            <CardTitle className="text-sm">Create GIF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <button
              type="button"
              onClick={() => inputRef.current && inputRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(Array.from(e.dataTransfer.files || []));
              }}
              className="flex h-16 w-full items-center justify-center rounded-xl border border-dashed text-sm"
            >
              Drop or add images
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addFiles(Array.from(e.target.files || []))}
            />
            <div>
              <div className="mb-2 flex justify-between text-xs">
                <Label className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Delay
                </Label>
                <span>{delayMs}ms</span>
              </div>
              <Slider
                value={[delayMs]}
                min={150}
                max={1000}
                step={50}
                onValueChange={(v) => setDelayMs(v[0])}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[240, 320, 400].map((n) => (
                <button
                  key={"s" + n}
                  type="button"
                  onClick={() => setSize(n)}
                  className={cn(
                    "h-10 rounded-xl border text-xs font-bold",
                    size === n
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-border",
                  )}
                >
                  {n}px
                </button>
              ))}
            </div>
            <Button
              className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              disabled={busy || frames.length < 2}
              onClick={createGif}
            >
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Create square GIF
            </Button>
            <p className="text-[11px] text-foreground/50">
              Output is always square. Chat apps will not cut the sides.
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="mt-16">
        <h2 className="mb-6 text-2xl font-black tracking-tight">FAQ</h2>
        <Accordion
          type="single"
          collapsible
          className="rounded-[1.6rem] border border-border bg-card px-4"
        >
          <AccordionItem value="q1">
            <AccordionTrigger>
              How do I make a GIF from images?
            </AccordionTrigger>
            <AccordionContent>
              Add 2 or more photos, set the delay, then press Create square GIF.
              The file downloads as .gif.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger>Do my photos get uploaded?</AccordionTrigger>
            <AccordionContent>
              No. Images stay in your browser. Nothing is sent to a server.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3">
            <AccordionTrigger>Why is the GIF square?</AccordionTrigger>
            <AccordionContent>
              Chat apps crop wide GIFs. A square canvas keeps the full photo
              visible.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q4">
            <AccordionTrigger>
              Why does WhatsApp show a still image?
            </AccordionTrigger>
            <AccordionContent>
              WhatsApp gallery sends a GIF as a photo. Send it as a Document /
              File so the animation stays.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q5">
            <AccordionTrigger>Which formats can I add?</AccordionTrigger>
            <AccordionContent>
              JPG, PNG, WebP, and other normal image files. Add up to 12 frames.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}
