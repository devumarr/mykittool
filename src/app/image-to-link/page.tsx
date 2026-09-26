"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Link as LinkIcon,
  Trash2,
  Copy,
  Loader2,
  ImageIcon,
  RotateCcw,
  History,
  X,
  FileUp,
  Settings2,
  KeyRound,
  Unplug,
  FileCode,
  Code2,
  MessageSquare,
  ExternalLink,
  Star,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GetHelp } from "@/components/mykittool/get-help";
import { useUser, useFirestore, useCollection } from "@/firebase";
import Link from "next/link";
import { uploadToImgBB, testImgBBKey } from "./actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  collection,
  query,
  where,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

interface LinkMatrix {
  direct: string;
  view: string;
  markdown: string;
  html: string;
  bbcode: string;
}
interface HistoryItem {
  id: string;
  uid: string;
  name: string;
  thumb: string;
  timestamp: number;
  isFavorite?: boolean;
  links: LinkMatrix;
}

const LOCAL_KEY = "mykit_image_to_link_local";

function fileToDataUrl(file: File) {
  return new Promise<string>((ok, err) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => err(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

async function compressDataUrl(dataUrl: string, max = 1600) {
  const img = new Image();
  img.src = dataUrl;
  await new Promise((ok, err) => {
    img.onload = () => ok(null);
    img.onerror = () => err(new Error("Bad image"));
  });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  if (scale >= 1 && dataUrl.length < 1_200_000) return dataUrl;
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.86);
}

export default function ImageToLinkPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [links, setLinks] = useState<LinkMatrix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [testing, setTesting] = useState(false);
  const [node, setNode] = useState<{ key: string; label: string } | null>(null);
  const [askOff, setAskOff] = useState(false);
  const [localHistory, setLocalHistory] = useState<HistoryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const historyQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "image_to_url_history"),
      where("uid", "==", user.uid),
    );
  }, [db, user]);
  const { data: historyData, loading: historyLoading } =
    useCollection<HistoryItem>(historyQuery as any);
  const cloud = useMemo(
    () =>
      historyData
        ? [...historyData].sort((a, b) => b.timestamp - a.timestamp)
        : [],
    [historyData],
  );
  const history = user ? cloud : localHistory;

  useEffect(() => {
    if (user) {
      const s = localStorage.getItem(`mykit_image_host_node_${user.uid}`);
      if (s)
        try {
          setNode(JSON.parse(s));
        } catch {}
    }
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setLocalHistory(JSON.parse(raw));
    } catch {}
  }, [user]);

  const persistLocal = (list: HistoryItem[]) => {
    setLocalHistory(list);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  };

  const saveHistory = (
    item: Omit<HistoryItem, "id" | "uid" | "isFavorite">,
  ) => {
    if (!db || !user) {
      persistLocal(
        [
          { ...item, id: `l_${Date.now()}`, uid: "local", isFavorite: false },
          ...localHistory,
        ].slice(0, 30),
      );
      return;
    }
    const ref = doc(collection(db, "image_to_url_history"));
    const payload = { ...item, id: ref.id, uid: user.uid, isFavorite: false };
    setDoc(ref, payload).catch(() => {
      errorEmitter.emit(
        "permission-error",
        new FirestorePermissionError({
          path: ref.path,
          operation: "create",
          requestResourceData: payload,
        }),
      );
    });
  };

  const removeItem = (id: string) => {
    if (!user) return persistLocal(localHistory.filter((x) => x.id !== id));
    if (!db) return;
    const ref = doc(db, "image_to_url_history", id);
    deleteDoc(ref).catch(() => {
      errorEmitter.emit(
        "permission-error",
        new FirestorePermissionError({ path: ref.path, operation: "delete" }),
      );
    });
  };

  const clearAll = async () => {
    if (!user) {
      persistLocal([]);
      toast({ title: "Cleared" });
      return;
    }
    if (!db || !history.length) return;
    const batch = writeBatch(db);
    history.forEach((h) => batch.delete(doc(db, "image_to_url_history", h.id)));
    await batch.commit();
    toast({ title: "Cleared" });
  };

  const star = (id: string) => {
    if (!user || !db) return;
    const item = history.find((h) => h.id === id);
    if (!item) return;
    const ref = doc(db, "image_to_url_history", id);
    updateDoc(ref, { isFavorite: !item.isFavorite }).catch(() => {
      errorEmitter.emit(
        "permission-error",
        new FirestorePermissionError({
          path: ref.path,
          operation: "update",
          requestResourceData: { isFavorite: !item.isFavorite },
        }),
      );
    });
  };

  const take = async (f: File) => {
    if (!f.type.startsWith("image/"))
      return toast({ variant: "destructive", title: "Image only" });
    if (f.size > 12 * 1024 * 1024)
      return toast({ variant: "destructive", title: "Max 12MB" });
    setFile(f);
    setLinks(null);
    setError(null);
    setImage(await fileToDataUrl(f));
  };

  const upload = async () => {
    if (!image) return;
    setBusy(true);
    setError(null);
    try {
      const payload = await compressDataUrl(image);
      const res = await uploadToImgBB(payload, node?.key);
      if (!res.success || !res.data)
        throw new Error(res.error || "Upload failed");
      const d = res.data;
      const matrix: LinkMatrix = {
        direct: d.url,
        view: d.url_viewer || d.url,
        markdown: `![image](${d.url})`,
        html: `<img src="${d.url}" alt="image" />`,
        bbcode: `[img]${d.url}[/img]`,
      };
      setLinks(matrix);
      saveHistory({
        name: file?.name || "image",
        thumb: d.thumb?.url || d.url,
        timestamp: Date.now(),
        links: matrix,
      });
      toast({ title: "Live link ready" });
    } catch (e: any) {
      setError(e.message || "Upload failed");
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: e.message,
      });
    } finally {
      setBusy(false);
    }
  };

  const connect = async () => {
    if (!customKey.trim()) return;
    setTesting(true);
    try {
      const res = await testImgBBKey(customKey.trim());
      if (!res.success) throw new Error(res.error || "Invalid key");
      const n = {
        key: customKey.trim(),
        label: customLabel.trim() || "Custom",
      };
      setNode(n);
      if (user)
        localStorage.setItem(
          `mykit_image_host_node_${user.uid}`,
          JSON.stringify(n),
        );
      setShowKey(false);
      setCustomKey("");
      setCustomLabel("");
      toast({ title: "Key connected" });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Key failed",
        description: e.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const copy = (t: string, id: string) => {
    navigator.clipboard.writeText(t);
    setCopied(id);
    toast({ title: "Copied" });
    setTimeout(() => setCopied(null), 1200);
  };

  useEffect(() => {
    const p = (e: ClipboardEvent) => {
      const f = e.clipboardData?.files?.[0];
      if (f) take(f);
    };
    window.addEventListener("paste", p);
    return () => window.removeEventListener("paste", p);
  }, []);

  const formats = links
    ? [
        { k: "Direct", v: links.direct, i: LinkIcon },
        { k: "Markdown", v: links.markdown, i: FileCode },
        { k: "HTML", v: links.html, i: Code2 },
        { k: "BBCode", v: links.bbcode, i: MessageSquare },
      ]
    : [];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-10 overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-blue-600/10 via-background to-orange-400/10 p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
              Hosting
            </p>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
              Image to Link
            </h1>
            <p className="mt-2 max-w-lg text-sm text-foreground/60">
              Public URL in one click. Compresses large files. History syncs
              when you are logged in.
            </p>
          </div>
          <div className="flex gap-2">
            <GetHelp toolId="image-to-link" />
            <Button
              variant="outline"
              className="h-10 rounded-xl"
              onClick={() => setShowKey((v) => !v)}
            >
              <Settings2 className="mr-2 h-4 w-4" />
              {node ? node.label : "API key"}
            </Button>
          </div>
        </div>
      </div>

      {authLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            {showKey && (
              <Card className="overflow-hidden rounded-[1.8rem] border border-border shadow-lg">
                <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-400" />
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <KeyRound className="h-4 w-4 text-blue-600" /> key
                  </CardTitle>
                  <button type="button" onClick={() => setShowKey(false)}>
                    <X className="h-4 w-4" />
                  </button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    type="password"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="API key"
                    className="h-11 rounded-xl"
                  />
                  <Input
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="Name"
                    className="h-11 rounded-xl"
                  />
                  <Button
                    className="h-11 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                    disabled={testing || !customKey}
                    onClick={connect}
                  >
                    {testing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Test and connect"
                    )}
                  </Button>
                  {node && (
                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-xl text-red-500"
                      onClick={() => setAskOff(true)}
                    >
                      <Unplug className="mr-2 h-4 w-4" /> Disconnect
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="overflow-hidden rounded-[1.8rem] border border-border shadow-xl">
              <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileUp className="h-4 w-4 text-blue-600" /> Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) take(f);
                  }}
                  className="group flex h-52 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/25 transition hover:border-blue-500/40"
                >
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      className="max-h-44 object-contain"
                    />
                  ) : (
                    <>
                      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 group-hover:scale-110 transition">
                        <ImageIcon className="h-6 w-6" />
                      </span>
                      <span className="text-sm font-medium">
                        Drop, click or paste
                      </span>
                      <span className="mt-1 text-[11px] text-foreground/45">
                        PNG JPG WEBP GIF · 12MB
                      </span>
                    </>
                  )}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && take(e.target.files[0])
                  }
                />
                <Button
                  className="h-12 w-full rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                  disabled={!image || busy}
                  onClick={upload}
                >
                  {busy ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LinkIcon className="mr-2 h-4 w-4" />
                  )}
                  Get link
                </Button>
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-xl"
                  onClick={() => {
                    setImage(null);
                    setFile(null);
                    setLinks(null);
                    setError(null);
                  }}
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
                {error && <p className="text-sm text-red-500">{error}</p>}
                {!user && (
                  <p className="text-xs text-foreground/50">
                    <Link
                      href="/login?redirect=/image-to-link"
                      className="font-semibold text-blue-600"
                    >
                      Login
                    </Link>{" "}
                    to keep history on all devices.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-8">
            {links ? (
              <Card className="overflow-hidden rounded-[1.8rem] border border-border shadow-xl">
                <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-orange-400" />
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Ready
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => copy(links.direct, "all")}
                    >
                      <Copy className="mr-1 h-3 w-3" />{" "}
                      {copied === "all" ? "Copied" : "Copy URL"}
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      asChild
                    >
                      <a href={links.direct} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-1 h-3 w-3" /> Open
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="flex items-center justify-center rounded-2xl bg-muted/30 p-4">
                    <img
                      src={image || links.direct}
                      alt=""
                      className="max-h-56 object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    {formats.map((f) => (
                      <div
                        key={f.k}
                        className="rounded-xl border border-border bg-card p-3 transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-2 text-xs font-bold">
                            <f.i className="h-3 w-3 text-blue-600" /> {f.k}
                          </span>
                          <button
                            type="button"
                            className="text-xs font-semibold text-blue-600"
                            onClick={() => copy(f.v, f.k)}
                          >
                            {copied === f.k ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <p className="truncate font-mono text-[11px] text-foreground/60">
                          {f.v}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-[1.8rem] border border-dashed border-border p-10 text-center text-sm text-foreground/50">
                Upload an image to see live links here.
              </Card>
            )}

            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <History className="h-4 w-4 text-blue-600" /> History
              </h2>
              {history.length > 0 && (
                <button
                  type="button"
                  className="text-xs text-red-500"
                  onClick={clearAll}
                >
                  Clear all
                </button>
              )}
            </div>

            {historyLoading && user ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            ) : history.length === 0 ? (
              <p className="text-sm text-foreground/50">No uploads yet.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-border transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3 p-3">
                      <img
                        src={item.thumb}
                        alt=""
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-foreground/45">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {user && (
                        <button type="button" onClick={() => star(item.id)}>
                          <Star
                            className={cn(
                              "h-4 w-4",
                              item.isFavorite &&
                                "fill-yellow-400 text-yellow-400",
                            )}
                          />
                        </button>
                      )}
                      <button type="button" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() =>
                          setOpenId(openId === item.id ? null : item.id)
                        }
                      >
                        {openId === item.id ? "Hide" : "Links"}
                      </Button>
                    </div>
                    {openId === item.id && (
                      <div className="space-y-2 border-t border-border bg-muted/20 p-3">
                        {(
                          ["direct", "markdown", "html", "bbcode"] as const
                        ).map((k) => (
                          <div key={k} className="flex items-center gap-2">
                            <span className="w-20 shrink-0 text-[10px] font-bold uppercase text-foreground/45">
                              {k}
                            </span>
                            <span className="min-w-0 flex-1 truncate font-mono text-xs">
                              {item.links[k]}
                            </span>
                            <button
                              type="button"
                              onClick={() => copy(item.links[k], item.id + k)}
                            >
                              <Copy className="h-3.5 w-3.5 text-blue-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          <section className="mx-auto mt-16 max-w-3xl">
            <h2 className="mb-6 text-xl font-bold">Image to Link FAQ</h2>
            <div className="space-y-3">
              {[
                {
                  q: "Does Image to Link upload my photo to My Kit Tool servers?",
                  a: "The image is sent to the image host to create a public URL. History is saved to your account if you are logged in.",
                },
                {
                  q: "What link formats do I get?",
                  a: "Direct URL, Markdown, HTML and BBCode.",
                },
                {
                  q: "Can I use my own ImgBB API key?",
                  a: "Yes. Open API key, paste the key, then Test and connect.",
                },
                {
                  q: "Is this tool free?",
                  a: "Yes. Image to Link on My Kit Tool is free.",
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
      )}

      <AlertDialog open={askOff} onOpenChange={setAskOff}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect key?</AlertDialogTitle>
            <AlertDialogDescription>
              Default ImgBB key will be used.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setNode(null);
                if (user)
                  localStorage.removeItem(`mykit_image_host_node_${user.uid}`);
              }}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
