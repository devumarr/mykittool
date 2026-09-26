"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Upload,
  FileArchive,
  Trash2,
  Copy,
  Download,
  Loader2,
  LayoutGrid,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import JSZip from "jszip";

const SIZES = [
  { size: 16, file: "favicon-16x16.png", desc: "Tab small" },
  { size: 32, file: "favicon-32x32.png", desc: "Standard tab" },
  { size: 48, file: "favicon-48x48.png", desc: "Windows" },
  { size: 180, file: "apple-touch-icon.png", desc: "iOS" },
  { size: 192, file: "android-chrome-192x192.png", desc: "Android" },
  { size: 512, file: "android-chrome-512x512.png", desc: "PWA" },
];

type IconOut = { size: number; file: string; desc: string; url: string };

function dataUrlToBytes(url: string) {
  const b64 = url.split(",")[1];
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function pngsToIco(pngs: Uint8Array[]) {
  const count = pngs.length;
  let offset = 6 + 16 * count;
  const header = new Uint8Array(
    offset + pngs.reduce((n, p) => n + p.length, 0),
  );
  const view = new DataView(header.buffer);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, count, true);
  let pos = 6;
  let dataAt = offset;
  pngs.forEach((png) => {
    const size = Math.min(256, Math.round(Math.sqrt(png.length)) || 32);
    header[pos] = size >= 256 ? 0 : size;
    header[pos + 1] = size >= 256 ? 0 : size;
    header[pos + 2] = 0;
    header[pos + 3] = 0;
    view.setUint16(pos + 4, 1, true);
    view.setUint16(pos + 6, 32, true);
    view.setUint32(pos + 8, png.length, true);
    view.setUint32(pos + 12, dataAt, true);
    header.set(png, dataAt);
    dataAt += png.length;
    pos += 16;
  });
  return header;
}

export default function FaviconGeneratorPage() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [icons, setIcons] = useState<IconOut[]>([]);
  const [busy, setBusy] = useState(false);
  const [pad, setPad] = useState(8);
  const [bg, setBg] = useState("#ffffff");
  const [clearBg, setClearBg] = useState(true);
  const [app, setApp] = useState("My App");
  const [theme, setTheme] = useState("#2563eb");

  const loadFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Image only" });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Max 15MB" });
      return;
    }
    setName(file.name);
    const r = new FileReader();
    r.onload = () => setSrc(String(r.result));
    r.readAsDataURL(file);
  };

  const build = useCallback(async () => {
    if (!src) return;
    setBusy(true);
    const img = new Image();
    img.src = src;
    await new Promise((ok, err) => {
      img.onload = () => ok(null);
      img.onerror = () => err(new Error("bad image"));
    });
    const side = Math.min(img.width, img.height);
    const sx = (img.width - side) / 2;
    const sy = (img.height - side) / 2;
    const out: IconOut[] = SIZES.map((s) => {
      const c = document.createElement("canvas");
      c.width = s.size;
      c.height = s.size;
      const ctx = c.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      if (!clearBg) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, s.size, s.size);
      }
      const inset = Math.round((s.size * pad) / 100);
      ctx.drawImage(
        img,
        sx,
        sy,
        side,
        side,
        inset,
        inset,
        s.size - inset * 2,
        s.size - inset * 2,
      );
      return { ...s, url: c.toDataURL("image/png") };
    });
    setIcons(out);
    setBusy(false);
  }, [src, pad, bg, clearBg]);

  useEffect(() => {
    if (src) build();
  }, [src, build]);

  const downloadOne = (item: IconOut) => {
    const a = document.createElement("a");
    a.href = item.url;
    a.download = item.file;
    a.click();
  };

  const downloadZip = async () => {
    if (!icons.length) return;
    setBusy(true);
    const zip = new JSZip();
    icons.forEach((i) =>
      zip.file(i.file, i.url.split(",")[1], { base64: true }),
    );
    const icoPngs = icons
      .filter((i) => [16, 32, 48].includes(i.size))
      .map((i) => dataUrlToBytes(i.url));
    if (icoPngs.length) zip.file("favicon.ico", pngsToIco(icoPngs));
    zip.file(
      "site.webmanifest",
      JSON.stringify(
        {
          name: app,
          short_name: app,
          icons: [
            {
              src: "/android-chrome-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/android-chrome-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
          theme_color: theme,
          background_color: clearBg ? "#ffffff" : bg,
          display: "standalone",
        },
        null,
        2,
      ),
    );
    zip.file(
      "README.txt",
      "Put files in /public. Use the HTML snippet from the tool.",
    );
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "favicon-pack.zip";
    a.click();
    setBusy(false);
  };

  const snippet = `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

  const nextSnippet = `export const metadata = {
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};`;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
          Developer tools
        </p>
        <h1 className="text-3xl font-black tracking-tight md:text-5xl">
          Favicon Generator
        </h1>
        <p className="mt-3 max-w-xl text-sm text-foreground/60">
          Make PNG pack, ICO and web manifest from one logo. Runs in the
          browser.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="overflow-hidden rounded-[1.8rem] border border-border lg:col-span-4">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
          <CardHeader>
            <CardTitle className="text-sm">Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) loadFile(f);
              }}
              className="flex h-44 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30"
            >
              {src ? (
                <img src={src} alt="" className="max-h-28 object-contain" />
              ) : (
                <>
                  <Upload className="mb-2 h-6 w-6 text-blue-600" />
                  <span className="text-sm text-foreground/55">
                    Drop or click
                  </span>
                </>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) loadFile(f);
              }}
            />
            {name && (
              <p className="truncate text-xs text-foreground/50">{name}</p>
            )}

            <div className="space-y-1">
              <Label>Padding {pad}%</Label>
              <input
                type="range"
                min={0}
                max={30}
                value={pad}
                onChange={(e) => setPad(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={clearBg}
                onChange={(e) => setClearBg(e.target.checked)}
              />
              Transparent background
            </label>
            {!clearBg && (
              <div className="flex items-center gap-2">
                <Label>Fill</Label>
                <input
                  type="color"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-1">
              <Label>App name</Label>
              <Input
                value={app}
                onChange={(e) => setApp(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label>Theme</Label>
              <input
                type="color"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>

            <Button
              className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              disabled={!icons.length || busy}
              onClick={downloadZip}
            >
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileArchive className="mr-2 h-4 w-4" />
              )}
              Download ZIP
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full rounded-xl"
              onClick={() => {
                setSrc(null);
                setIcons([]);
                setName("");
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-8">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {SIZES.map((s) => {
              const item = icons.find((i) => i.size === s.size);
              return (
                <Card
                  key={s.size}
                  className="overflow-hidden rounded-2xl border border-border"
                >
                  <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-400" />
                  <CardContent className="space-y-3 p-4 text-center">
                    <p className="text-xs font-bold">{s.file}</p>
                    <div className="flex h-28 items-center justify-center bg-muted/30">
                      {item ? (
                        <img
                          src={item.url}
                          alt=""
                          style={{ width: Math.min(96, s.size) }}
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-foreground/20" />
                      )}
                    </div>
                    <p className="text-[11px] text-foreground/50">{s.desc}</p>
                    {item && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full rounded-lg"
                        onClick={() => downloadOne(item)}
                      >
                        <Download className="mr-1 h-3 w-3" /> PNG
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="overflow-hidden rounded-[1.8rem] border border-border">
            <div className="h-1 bg-gradient-to-r from-blue-600 to-sky-400" />
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Code2 className="h-4 w-4 text-blue-600" /> HTML
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(snippet);
                  toast({ title: "Copied" });
                }}
              >
                <Copy className="mr-1 h-4 w-4" /> Copy
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-xl bg-muted/40 p-4 text-xs">
                {snippet}
              </pre>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[1.8rem] border border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Next.js</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(nextSnippet);
                  toast({ title: "Copied" });
                }}
              >
                <Copy className="mr-1 h-4 w-4" /> Copy
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-xl bg-muted/40 p-4 text-xs">
                {nextSnippet}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
      <section className="mx-auto mt-16 max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold">Favicon Generator FAQ</h2>
            <p className="text-sm text-foreground/55">
              How to use the icon pack
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            {
              q: "What sizes are generated?",
              a: "16, 32, 48, 180 (Apple), 192 and 512 (Android/PWA), plus a multi-size favicon.ico in the ZIP.",
            },
            {
              q: "Where do I put the files?",
              a: "Put them in your site root or /public folder, then paste the HTML or Next.js snippet.",
            },
            {
              q: "Does this upload my logo?",
              a: "No. Icons are made in your browser.",
            },
            {
              q: "Is Favicon Generator free?",
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
