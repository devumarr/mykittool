"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Code2,
  Eye,
  Plus,
  Trash2,
  FileArchive,
  FolderOpen,
  Download,
  Image as ImageIcon,
  FileCode,
  FileJson,
  FileText,
  Layout,
  Loader2,
  Maximize2,
  Copy,
  Smartphone,
  Monitor,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import JSZip from "jszip";

type VFile = {
  name: string;
  path: string;
  content: string;
  isImage: boolean;
  blobUrl?: string;
};
type View = "editor" | "split" | "preview";

function mime(path: string) {
  const p = path.toLowerCase();
  if (p.endsWith(".html")) return "text/html";
  if (p.endsWith(".css")) return "text/css";
  if (p.endsWith(".js")) return "text/javascript";
  if (p.endsWith(".json")) return "application/json";
  if (p.endsWith(".svg")) return "image/svg+xml";
  return "text/plain";
}
function isImg(path: string) {
  return /\.(png|jpe?g|gif|webp|svg|ico|bmp)$/i.test(path);
}

const BLANK = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Preview</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Hello</h1>
  <script src="script.js"></script>
</body>
</html>`;

export default function CodePreviewPage() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const frameWrap = useRef<HTMLDivElement>(null);
  const previewUrls = useRef<string[]>([]);
  const [files, setFiles] = useState<Map<string, VFile>>(new Map());
  const [active, setActive] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [html, setHtml] = useState("");
  const [view, setView] = useState<View>("split");
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState(false);
  const [drag, setDrag] = useState(false);

  const list = useMemo(() => Array.from(files.values()), [files]);
  const pickEntry = (map: Map<string, VFile>) => {
    const keys = Array.from(map.keys());
    return (
      keys.find((k) => k.toLowerCase().endsWith("index.html")) ||
      keys.find((k) => k.toLowerCase().endsWith(".html")) ||
      keys[0] ||
      null
    );
  };
  const openFile = (path: string, map = files) => {
    const f = map.get(path);
    if (!f) return;
    setActive(path);
    setCode(f.isImage ? "" : f.content);
  };

  const addFiles = async (incoming: File[]) => {
    if (!incoming.length) return;
    setBusy(true);
    const next = new Map(files);
    for (const file of incoming) {
      const path =
        (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
        file.name;
      if (isImg(path) || file.type.startsWith("image/")) {
        next.set(path, {
          name: file.name,
          path,
          content: "",
          isImage: true,
          blobUrl: URL.createObjectURL(file),
        });
      } else {
        next.set(path, {
          name: file.name,
          path,
          content: await file.text(),
          isImage: false,
        });
      }
    }
    setFiles(next);
    const first = pickEntry(next);
    if (first) openFile(first, next);
    setBusy(false);
    toast({ title: `${incoming.length} file(s) added` });
  };

  const loadZip = async (file: File) => {
    setBusy(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const next = new Map<string, VFile>();
      for (const [path, entry] of Object.entries(zip.files)) {
        if (entry.dir) continue;
        const name = path.split("/").pop() || path;
        if (isImg(path)) {
          const blob = await entry.async("blob");
          next.set(path, {
            name,
            path,
            content: "",
            isImage: true,
            blobUrl: URL.createObjectURL(blob),
          });
        } else {
          next.set(path, {
            name,
            path,
            content: await entry.async("text"),
            isImage: false,
          });
        }
      }
      setFiles(next);
      const first = pickEntry(next);
      if (first) openFile(first, next);
      toast({ title: "ZIP loaded" });
    } catch {
      toast({ variant: "destructive", title: "ZIP failed" });
    } finally {
      setBusy(false);
    }
  };

  const starter = () => {
    const next = new Map<string, VFile>([
      [
        "index.html",
        {
          name: "index.html",
          path: "index.html",
          content: BLANK,
          isImage: false,
        },
      ],
      [
        "style.css",
        {
          name: "style.css",
          path: "style.css",
          content: "body{font-family:sans-serif;padding:24px}",
          isImage: false,
        },
      ],
      [
        "script.js",
        {
          name: "script.js",
          path: "script.js",
          content: "console.log('ready')",
          isImage: false,
        },
      ],
    ]);
    setFiles(next);
    openFile("index.html", next);
  };

  const buildPreview = useCallback(() => {
    previewUrls.current.forEach((u) => URL.revokeObjectURL(u));
    previewUrls.current = [];
    const entry =
      Array.from(files.keys()).find((k) =>
        k.toLowerCase().endsWith("index.html"),
      ) ||
      Array.from(files.keys()).find((k) => k.toLowerCase().endsWith(".html"));
    if (!entry) {
      setHtml("");
      return;
    }
    let doc = String(files.get(entry)?.content || "");
    files.forEach((file, path) => {
      if (path === entry) return;
      const names = [
        path,
        path.replace(/^.*\//, ""),
        "./" + path.replace(/^.*\//, ""),
      ];
      let url = file.blobUrl;
      if (!url) {
        url = URL.createObjectURL(
          new Blob([file.content], { type: mime(path) }),
        );
        previewUrls.current.push(url);
      }
      names.forEach((n) => {
        const safe = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        doc = doc.replace(
          new RegExp(`(src|href)=["']${safe}["']`, "gi"),
          `$1="${url}"`,
        );
      });
    });
    setHtml(doc);
  }, [files]);

  useEffect(() => {
    const t = setTimeout(buildPreview, 350);
    return () => clearTimeout(t);
  }, [files, buildPreview]);

  const clearAll = () => {
    files.forEach((f) => f.blobUrl && URL.revokeObjectURL(f.blobUrl));
    previewUrls.current.forEach((u) => URL.revokeObjectURL(u));
    previewUrls.current = [];
    setFiles(new Map());
    setActive(null);
    setCode("");
    setHtml("");
  };

  const [full, setFull] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openFull = () => {
    if (!html) return;
    setFull(true);
  };

  const icon = (f: VFile) => {
    if (f.isImage) return <ImageIcon className="h-4 w-4 text-emerald-500" />;
    if (f.name.endsWith(".html"))
      return <Layout className="h-4 w-4 text-orange-500" />;
    if (f.name.endsWith(".css"))
      return <FileCode className="h-4 w-4 text-blue-500" />;
    if (f.name.endsWith(".js"))
      return <FileJson className="h-4 w-4 text-yellow-500" />;
    return <FileText className="h-4 w-4 text-foreground/40" />;
  };

  return (
    <div
      className="container mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16"
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        addFiles(Array.from(e.dataTransfer.files || []));
      }}
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
            Developer tools
          </p>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">
            Code Preview
          </h1>
          <p className="mt-3 max-w-xl text-sm text-foreground/60">
            Edit HTML/CSS/JS and preview live. Drop files or a ZIP.
          </p>
        </div>
        <div className="flex rounded-xl border border-border p-1">
          {(["editor", "split", "preview"] as View[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-bold capitalize",
                view === id ? "bg-blue-600 text-white" : "text-foreground/60",
              )}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => addFiles(Array.from(e.target.files || []))}
      />
      <input
        ref={zipRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) loadZip(f);
          e.target.value = "";
        }}
      />

      {files.size === 0 ? (
        <Card
          className={cn(
            "overflow-hidden rounded-[1.8rem] border",
            drag ? "border-blue-600" : "border-border",
          )}
        >
          <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
          <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-4 p-10 text-center">
            <FolderOpen className="h-12 w-12 text-blue-600" />
            <p className="text-sm text-foreground/60">
              Drop files here or start a blank page
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => fileRef.current?.click()}
              >
                <Plus className="mr-2 h-4 w-4" /> Files
              </Button>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => zipRef.current?.click()}
              >
                <FileArchive className="mr-2 h-4 w-4" /> ZIP
              </Button>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={starter}
              >
                Blank project
              </Button>
            </div>
            {busy && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-12">
          <Card className="overflow-hidden rounded-[1.8rem] border border-border lg:col-span-3">
            <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-400" />
            <CardHeader className="flex flex-row items-center justify-between border-b border-border py-3">
              <span className="text-sm font-bold">Files</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-foreground/40 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="max-h-[520px] space-y-1 overflow-auto p-2">
              {list.map((f) => (
                <button
                  key={f.path}
                  type="button"
                  onClick={() => openFile(f.path)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm",
                    active === f.path
                      ? "bg-blue-600/10 text-blue-600"
                      : "hover:bg-muted",
                  )}
                >
                  {icon(f)}
                  <span className="truncate">{f.name}</span>
                </button>
              ))}
              <Button
                variant="outline"
                className="mt-2 h-10 w-full rounded-xl"
                onClick={() => fileRef.current?.click()}
              >
                Add files
              </Button>
            </CardContent>
          </Card>

          {(view === "split" || view === "editor") && (
            <Card
              className={cn(
                "overflow-hidden rounded-[1.8rem] border border-border",
                view === "split" ? "lg:col-span-4" : "lg:col-span-9",
              )}
            >
              <div className="h-1 bg-gradient-to-r from-blue-600 to-sky-400" />
              <CardHeader className="flex flex-row items-center justify-between border-b border-border py-3">
                <span className="flex items-center gap-2 text-sm font-bold">
                  <Code2 className="h-4 w-4 text-blue-600" />{" "}
                  {active?.split("/").pop() || "Editor"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    toast({ title: "Copied" });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {active && files.get(active)?.isImage ? (
                  <div className="flex min-h-[420px] items-center justify-center p-6">
                    <img
                      src={files.get(active)?.blobUrl}
                      alt=""
                      className="max-h-[380px] object-contain"
                    />
                  </div>
                ) : (
                  <textarea
                    value={code}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCode(v);
                      if (!active) return;
                      setFiles((prev) => {
                        const n = new Map(prev);
                        const f = n.get(active);
                        if (f) n.set(active, { ...f, content: v });
                        return n;
                      });
                    }}
                    spellCheck={false}
                    className="min-h-[420px] w-full resize-none bg-muted/20 p-4 font-mono text-sm outline-none"
                  />
                )}
              </CardContent>
            </Card>
          )}

          {(view === "split" || view === "preview") && (
            <Card
              className={cn(
                "overflow-hidden rounded-[1.8rem] border border-border",
                view === "split" ? "lg:col-span-5" : "lg:col-span-9",
              )}
            >
              <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-400" />
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-border py-3">
                <span className="flex items-center gap-2 text-sm font-bold">
                  <Eye className="h-4 w-4 text-blue-600" /> Preview
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => setPhone(false)}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => setPhone(true)}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    onClick={buildPreview}
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    onClick={openFull}
                  >
                    <Maximize2 className="mr-1 h-4 w-4" /> Full
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="bg-muted/20 p-3">
                <div
                  ref={frameWrap}
                  className={cn(
                    "mx-auto overflow-hidden rounded-xl bg-white",
                    phone
                      ? "h-[560px] w-[360px] max-w-full"
                      : "h-[420px] w-full",
                  )}
                >
                  {html ? (
                    <iframe
                      title="preview"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      srcDoc={html}
                      className="h-full w-full bg-white"
                    />
                  ) : (
                    <p className="p-8 text-sm text-foreground/50">
                      Add an HTML file
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {full && (
            <div className="fixed inset-0 z-[200] bg-black">
              <button
                type="button"
                onClick={() => setFull(false)}
                className="absolute right-4 top-4 z-[201] rounded-xl bg-white px-4 py-2 text-sm font-bold text-black"
              >
                Back
              </button>
              <iframe
                title="full-preview"
                sandbox="allow-scripts allow-same-origin allow-forms"
                srcDoc={html}
                className="h-full w-full bg-white"
              />
            </div>
          )}
        </div>
      )}
      <section className="mx-auto mt-16 max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
            <Code2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold">Code Preview FAQ</h2>
            <p className="text-sm text-foreground/55">How live preview works</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            {
              q: "What files can I preview?",
              a: "HTML, CSS, JS and images. You can also upload a ZIP of a small website.",
            },
            {
              q: "Does Code Preview upload my project?",
              a: "No. Files stay in your browser. Preview runs locally.",
            },
            {
              q: "How do I open full screen?",
              a: "Click Full. Use Back on that screen to return to the same editor.",
            },
            {
              q: "Is this tool free?",
              a: "Yes. Code Preview on My Kit Tool is free.",
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
