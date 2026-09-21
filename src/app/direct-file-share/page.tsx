"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Share2,
  Upload,
  X,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Copy,
  File as FileIcon,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
  Download,
  Smartphone,
  Globe,
  Clock,
  QrCode,
  Lock,
  MessageCircle,
  Trash2,
  FileArchive,
  ArrowRight,
  TrendingUp,
  Plus,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GetHelp } from "@/components/mykittool/get-help";
import JSZip from "jszip";

const CHUNK_SIZE = 16384; // 16KB for P2P stability

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

interface PeerStats {
  id: string;
  progress: number;
  speed: string;
  status: "connecting" | "verifying" | "sending" | "done";
}

export default function DirectFileSharePage() {
  const { toast } = useToast();

  // File State
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [shouldZip, setShouldZip] = useState(false);
  const filesRef = useRef(files);
  const shouldZipRef = useRef(shouldZip);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  useEffect(() => {
    shouldZipRef.current = shouldZip;
  }, [shouldZip]);

  // Connection State
  const [peerId, setPeerId] = useState("");
  const [peer, setPeer] = useState<any>(null);
  const [connections, setConnections] = useState<Record<string, PeerStats>>({});
  const [showQr, setShowQr] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<any>(null);

  // 1. startPeer
  useEffect(() => {
    let p: any;
    const init = async () => {
      const { default: Peer } = await import("peerjs");
      p = new Peer();
      setPeer(p);

      p.on("open", (id: string) => setPeerId(id));

      p.on("connection", (conn: any) => {
        const connId = conn.peer;

        // Notification
        toast({
          title: "Peer Connected",
          description: "Someone is preparing to receive your files.",
        });

        setConnections((prev) => ({
          ...prev,
          [connId]: {
            id: connId,
            progress: 0,
            speed: "0 KB/s",
            status: "connecting",
          },
        }));

        conn.on("open", () => {
          startTransfer(conn);
        });

        conn.on("close", () => {
          setConnections((prev) => {
            const next = { ...prev };
            delete next[connId];
            return next;
          });
        });
      });
    };

    init();
    return () => {
      if (p) p.destroy();
    };
  }, []);

  // 2. Transfer Logic
  const startTransfer = async (conn: any) => {
    const currentFiles: any[] = ((filesRef.current || []) as any[]).filter(
      (item: any) => item && item.file,
    );

    if (!currentFiles.length) {
      toast({
        title: "No files selected",
        description: "Sender page par pehle file add karo, phir link kholo.",
      });
      return;
    }

    const connId = conn.peer;
    setConnections((prev) => ({
      ...prev,
      [connId]: { ...prev[connId], status: "sending" },
    }));

    let payload: Blob;
    let fileName: string;
    let fileType: string;

    try {
      if (shouldZipRef.current && currentFiles.length > 1) {
        const zip = new JSZip();
        currentFiles.forEach((f) => zip.file(f.name || "file", f.file));
        payload = await zip.generateAsync({ type: "blob" });
        fileName = `bundle_${Date.now()}.zip`;
        fileType = "application/zip";
      } else {
        const f = currentFiles[0];
        payload = f.file;
        fileName = f.name;
        fileType = f.type || "application/octet-stream";
      }
    } catch (err) {
      toast({
        title: "Could not prepare file",
        description: "File dubara add karo, phir link share karo.",
      });
      return;
    }
    conn.send({
      type: "meta",
      name: fileName,
      size: payload.size,
      mime: fileType,
      count: files.length,
    });

    const reader = new FileReader();
    let offset = 0;
    let lastTime = Date.now();
    let lastOffset = 0;

    reader.onload = (e: any) => {
      if (e.target.result) {
        conn.send({ type: "chunk", data: e.target.result });
        offset += e.target.result.byteLength;

        // Performance Stats
        const now = Date.now();
        if (now - lastTime > 1000) {
          const bytesPerSec = (offset - lastOffset) / ((now - lastTime) / 1000);
          const speedStr =
            bytesPerSec > 1024 * 1024
              ? `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`
              : `${(bytesPerSec / 1024).toFixed(1)} KB/s`;

          setConnections((prev) => ({
            ...prev,
            [connId]: {
              ...prev[connId],
              progress: Math.round((offset / payload.size) * 100),
              speed: speedStr,
            },
          }));

          lastTime = now;
          lastOffset = offset;
        }

        if (offset < payload.size) {
          readNext();
        } else {
          conn.send({ type: "end" });
          setConnections((prev) => ({
            ...prev,
            [connId]: {
              ...prev[connId],
              status: "done",
              progress: 100,
              speed: "0 KB/s",
            },
          }));
        }
      }
    };

    const readNext = () => {
      const slice = payload.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    };

    readNext();
  };

  // 3. File Handling
  const handleFiles = (incoming: FileList | File[]) => {
    const newItems: QueuedFile[] = Array.from(incoming).map((file) => {
      const item: QueuedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      };
      if (file.type.startsWith("image/")) {
        item.preview = URL.createObjectURL(file);
      }
      return item;
    });
    setFiles((prev) => [...prev, ...newItems]);
    toast({ title: "Files added" });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  // 4. QR Synthesis
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !peerId) return "";
    return `${window.location.origin}/share/${peerId}`;
  }, [peerId]);

  useEffect(() => {
    if (!showQr || !shareUrl || !qrRef.current) return;

    const box = qrRef.current;
    box.innerHTML = "";

    const img = document.createElement("img");
    img.alt = "Share QR";
    img.width = 280;
    img.height = 280;
    img.className = "h-[280px] w-[280px] rounded-xl";
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(shareUrl)}`;
    box.appendChild(img);
  }, [showQr, shareUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast({ title: "Link copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="mb-10 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1220] via-[#101826] to-[#0a0f18] px-6 py-8 sm:px-10 sm:py-10">
      <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-300">
            <Share2 className="h-3.5 w-3.5" />
            Direct File Share
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Send files
            <span className="bg-gradient-to-r from-sky-300 to-indigo-300 bg-clip-text text-transparent">
              {" "}
              live
            </span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
            Device to device. No cloud upload. Link Open and transfer start.
          </p>

          <div className="mt-5 flex flex-wrap gap-2"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Main Workspace */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] bg-secondary/10">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-border bg-card/70 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-[0_8px_20px_-12px_hsl(var(--primary))] transition-transform duration-300 hover:-translate-y-0.5">
                  <FileIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    File queue
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {files.length} {files.length === 1 ? "item" : "items"} ready
                  </p>
                </div>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_24px_-10px_hsl(var(--primary))] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-12px_hsl(var(--primary))] active:scale-95"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <CardContent className="flex flex-1 flex-col p-5 sm:p-7">
              {files.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
                  }}
                  className="group flex flex-1 cursor-pointer flex-col items-center justify-center gap-5 rounded-[1.8rem] border border-dashed border-border bg-background/60 px-6 py-12 transition-all duration-300 hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-border bg-card text-primary shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                    <Upload className="h-7 w-7" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Drop files or tap to add
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      No Limit Of File
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    onChange={(e) =>
                      e.target.files && handleFiles(e.target.files)
                    }
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="custom-scrollbar grid max-h-[360px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                    {files.map((f) => (
                      <div
                        key={f.id}
                        className="group/item flex items-center gap-3 rounded-2xl border border-border bg-background p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary">
                          {f.preview ? (
                            <img
                              src={f.preview}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FileIcon className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {f.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {(f.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(f.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-red-500 hover:text-white sm:opacity-0 sm:group-hover/item:opacity-100"
                        >
                          <X className="h-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {peerId ? (
                    <div className="space-y-5 border-t border-border pt-6">
                      <div className="text-center">
                        <Label className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                          Share this link
                        </Label>
                        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-background px-4 py-4">
                          <p className="break-all text-sm font-medium text-foreground">
                            {shareUrl}
                          </p>
                        </div>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                          <Button
                            onClick={handleCopyLink}
                            className="h-11 rounded-xl px-5 shadow-[0_10px_24px_-12px_hsl(var(--primary))] transition-transform hover:-translate-y-0.5"
                          >
                            {isCopied ? (
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                            ) : (
                              <Copy className="mr-2 h-4 w-4" />
                            )}
                            {isCopied ? "Copied" : "Copy link"}
                          </Button>
                          <Button
                            onClick={() => setShowQr(true)}
                            variant="outline"
                            className="h-11 rounded-xl px-4 transition-transform hover:-translate-y-0.5"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            className="h-11 rounded-xl px-4 transition-transform hover:-translate-y-0.5"
                          >
                            <a
                              href={`https://wa.me/?text=${encodeURIComponent("I sent you some files: " + shareUrl)}`}
                              target="_blank"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>

                      {/* Active Transfers */}
                      {Object.values(connections).length > 0 && (
                        <div className="space-y-4 pt-4 animate-in slide-in-from-bottom-2">
                          <div className="flex items-center justify-between px-2">
                            <h4 className="text-[10px] font-black uppercase bg-backgroung/20 tracking-widest">
                              Active Transfers
                            </h4>
                            <span className="text-[9px] font-bold text-green-500">
                              {Object.values(connections).length} Receiver(s)
                            </span>
                          </div>
                          <div className="space-y-3">
                            {Object.values(connections).map((c) => (
                              <div
                                key={c.id}
                                className="p-5 rounded-3xl bg-primary/10 border border-primary/20 space-y-4"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                      <Activity className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black bg-background/20 uppercase">
                                      {c.status}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-primary font-bold">
                                    {c.speed}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-[8px] font-black uppercase bg-background/20">
                                    <span>Progress</span>
                                    <span>{c.progress}%</span>
                                  </div>
                                  <Progress
                                    value={c.progress}
                                    className="h-1"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-3">
                        <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold uppercase leading-relaxed">
                          Keep this page open. If you close this tab, all
                          transfers will fail.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 py-10 opacity-30">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">
                        Generating secret link...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6 lg:col-span-5 xl:col-span-4">
          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <CardContent className="space-y-4 p-5 sm:p-6">
              {[
                {
                  icon: Zap,
                  title: "Wi‑Fi is faster",
                  desc: "Transfers are much quicker when both devices are on the same network.",
                  tone: "from-amber-400/20 to-orange-500/10 text-amber-600 dark:text-amber-400",
                },
                {
                  icon: Smartphone,
                  title: "Keep screens on",
                  desc: "Do not lock the phone or close the tab while a large file is sending.",
                  tone: "from-sky-400/20 to-blue-500/10 text-sky-600 dark:text-sky-400",
                },
                {
                  icon: ShieldCheck,
                  title: "Direct transfer",
                  desc: "Files move device to device. Nothing is stored in the cloud.",
                  tone: "from-emerald-400/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
                },
              ].map((tip) => (
                <div
                  key={tip.title}
                  className="group flex gap-4 rounded-2xl border border-border bg-background/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tip.tone} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <tip.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {tip.title}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {tip.desc}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {showQr && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 p-6 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-2xl sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Scan to receive
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Camera phone se QR scan karo
            </p>

            <div className="mx-auto mt-6 w-fit rounded-3xl border border-border bg-white p-4 shadow-lg">
              <div
                ref={qrRef}
                className="flex h-[280px] w-[280px] items-center justify-center"
              />
            </div>

            <p className="mt-4 break-all px-2 text-xs text-muted-foreground">
              {shareUrl}
            </p>

            <Button
              onClick={() => setShowQr(false)}
              className="mt-6 h-11 rounded-xl px-8"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          @apply bg-transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          @apply bg-primary/20 rounded-full;
        }
      `}</style>
    </div>
  );
}
