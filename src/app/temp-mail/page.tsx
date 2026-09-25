"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  RefreshCcw,
  Copy,
  Inbox,
  Mail,
  User,
  ArrowRight,
  Loader2,
  X,
  Zap,
  ShieldCheck,
  MessageSquare,
  Plus,
  Server,
  ChevronRight,
  Globe,
  CheckCircle2,
  Check,
  Search,
  Pin,
  PinOff,
  FileCode,
  FileDown,
  KeyRound,
  History,
  LayoutGrid,
  Smartphone,
  Unplug,
  HelpCircle,
  Lock,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GetHelp } from "@/components/mykittool/get-help";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import DOMPurify from "dompurify";
import { fetchFromProvider } from "./actions";
type ProviderRes = {
  success: boolean;
  email?: string;
  error?: string;
  messages?: any[];
  message?: any;
  sid?: string;
  token?: string;
};

const DEFAULT_PROVIDERS = [
  { id: "guerrilla", label: "Guerrilla Mail", icon: ShieldCheck },
  { id: "tempmail_lol", label: "TempMail.lol", icon: Zap },
  { id: "mailnesia", label: "Mailnesia", icon: Globe },
  { id: "tempmailc", label: "TempMailC", icon: Zap },
  { id: "mailforspam", label: "MailForSpam", icon: MessageSquare },
  { id: "temporam", label: "Temporam", icon: LayoutGrid },
  { id: "sharklasers", label: "Sharklasers", icon: ShieldCheck },
];

const REFRESH_RATE = 10;
const PIN_STORAGE_KEY = "mykit_tempmail_pinned_v1";
const HISTORY_STORAGE_KEY = "mykit_tempmail_history_v1";
const MUTE_STORAGE_KEY = "mykit_tempmail_mute_v1";
const CUSTOM_PROVIDERS_KEY = "mykit_tempmail_custom_nodes_v1";

interface MailMessage {
  id: string | number;
  from: string;
  subject: string;
  date: string;
  htmlBody?: string;
  body?: string;
}

interface FullMessage {
  id: string | number;
  from: string;
  subject: string;
  date: string;
  htmlBody: string;
  body: string;
}

interface HistoryItem {
  email: string;
  provider: string;
  timestamp: number;
}

interface CustomProvider {
  id: string;
  label: string;
  baseUrl: string;
  createUrl: string;
  inboxUrl: string;
  readUrl: string;
  headers: string;
  apiKey: string;
  paths: {
    email: string;
    messages: string;
    id: string;
    subject: string;
    from: string;
    body: string;
  };
}

/**
 * Polling Node Component
 * Encapsulates the timer logic to prevent parent re-renders every second.
 * This ensures stable text selection and interaction in the main studio workspace.
 */
function PollingNode({
  email,
  isRefreshing,
  onSync,
}: {
  email: string | null;
  isRefreshing: boolean;
  onSync: (silent?: boolean) => void;
}) {
  const [countdown, setCountdown] = useState(REFRESH_RATE);

  useEffect(() => {
    if (!email) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [email]);

  useEffect(() => {
    if (countdown === 0) {
      onSync(true);
      setCountdown(REFRESH_RATE);
    }
  }, [countdown, onSync]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        onSync();
        setCountdown(REFRESH_RATE);
      }}
      disabled={isRefreshing || !email}
      className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary"
    >
      <RefreshCcw
        className={cn("w-3.5 h-3.5 mr-2", isRefreshing && "animate-spin")}
      />{" "}
      {countdown > 0 ? countdown : "..."}S
    </Button>
  );
}

export default function TempMailPage() {
  const { toast } = useToast();

  // Settings & Status State
  const [provider, setProvider] = useState(DEFAULT_PROVIDERS[0].id);
  const [customNodes, setCustomNodes] = useState<CustomProvider[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [customUsername, setCustomUsername] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Data State
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<FullMessage | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedIds, setPinnedIds] = useState<Set<string | number>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Custom Node Form
  const [showAddNode, setShowAddNode] = useState(false);
  const [isTestingNode, setIsTestingNode] = useState(false);
  const [newNode, setNewNode] = useState<CustomProvider>({
    id: "",
    label: "",
    baseUrl: "",
    createUrl: "",
    inboxUrl: "",
    readUrl: "",
    headers: "{}",
    apiKey: "",
    paths: {
      email: "",
      messages: "",
      id: "id",
      subject: "subject",
      from: "from",
      body: "body",
    },
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- 1. Audio Notification Engine ---
  const playNotification = useCallback(() => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current)
        audioCtxRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }, [isMuted]);

  // --- 2. Handshake & Persistence ---
  useEffect(() => {
    const savedPins = localStorage.getItem(PIN_STORAGE_KEY);
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    const savedMute = localStorage.getItem(MUTE_STORAGE_KEY);
    const savedNodes = localStorage.getItem(CUSTOM_PROVIDERS_KEY);

    if (savedPins)
      try {
        setPinnedIds(new Set(JSON.parse(savedPins)));
      } catch (e) {}
    if (savedHistory)
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {}
    if (savedNodes)
      try {
        setCustomNodes(JSON.parse(savedNodes));
      } catch (e) {}
    if (savedMute !== null) setIsMuted(savedMute === "true");

    setIsLoaded(true);
    generateMail(DEFAULT_PROVIDERS[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        PIN_STORAGE_KEY,
        JSON.stringify(Array.from(pinnedIds)),
      );
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      localStorage.setItem(MUTE_STORAGE_KEY, isMuted.toString());
      localStorage.setItem(CUSTOM_PROVIDERS_KEY, JSON.stringify(customNodes));
    }
  }, [pinnedIds, history, isMuted, customNodes, isLoaded]);

  const allProviders = useMemo(() => {
    const customWithIcons = customNodes.map((n) => ({
      id: n.id,
      label: n.label,
      icon: Smartphone,
    }));
    return [...DEFAULT_PROVIDERS, ...customWithIcons];
  }, [customNodes]);

  const addToHistory = (newEmail: string, prov: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.email !== newEmail);
      return [
        { email: newEmail, provider: prov, timestamp: Date.now() },
        ...filtered,
      ].slice(0, 20);
    });
  };

  const generateMail = async (targetProvider = provider, username?: string) => {
    setIsLoading(true);
    setError(null);
    setMessages([]);
    setSessionData(null);
    setUnreadCount(0);

    const customConfig = customNodes.find((n) => n.id === targetProvider);

    try {
      const action = username ? "genCustomMailbox" : "genRandomMailbox";
      const res = (await fetchFromProvider(
        customConfig ? "custom" : targetProvider,
        { action, username, email },
        customConfig,
      )) as ProviderRes;

      if (res.success && res.email) {
        setEmail(res.email);
        setSessionData(res);
        addToHistory(res.email, targetProvider);
        toast({ title: "Identity Active", description: `${res.email} ready.` });
      } else {
        throw new Error(res.error || "Identity restricted on this node.");
      }
    } catch (err: any) {
      setError(
        err.message || `Node [${targetProvider.toUpperCase()}] restricted.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = useCallback(
    async (silent = false) => {
      if (!email) return;
      if (!silent) setIsRefreshing(true);

      const customConfig = customNodes.find((n) => n.id === provider);

      try {
        const res = (await fetchFromProvider(
          customConfig ? "custom" : provider,
          {
            action: "getMessages",
            email,
            sid: sessionData?.sid,
            token: sessionData?.token,
          },
          customConfig,
        )) as ProviderRes;

        if (res.success && Array.isArray(res.messages)) {
          const incomingMsgs = res.messages;

          setMessages((prev) => {
            if (incomingMsgs.length === 0 && prev.length > 0) return prev;

            const prevMap = new Map(prev.map((m) => [m.id.toString(), m]));
            let newDetected = false;

            incomingMsgs.forEach((msg) => {
              if (!prevMap.has(msg.id.toString())) {
                prevMap.set(msg.id.toString(), msg);
                newDetected = true;
              }
            });

            if (!newDetected) return prev;

            if (prev.length > 0) playNotification();
            const newCount = incomingMsgs.filter(
              (m) => !prev.some((p) => p.id.toString() === m.id.toString()),
            ).length;
            setUnreadCount((u) => u + newCount);

            return Array.from(prevMap.values()).sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
          });
        }
      } catch (err) {
        console.warn("Polling interrupted.");
      } finally {
        if (!silent) setIsRefreshing(false);
      }
    },
    [provider, email, sessionData, customNodes, playNotification],
  );

  useEffect(() => {
    if (!email) return;
    fetchMessages(true);
    const t = setInterval(() => fetchMessages(true), 8000);
    return () => clearInterval(t);
  }, [email, fetchMessages]);

  const handleProviderChange = (newVal: string) => {
    setProvider(newVal);
    generateMail(newVal);
  };

  const readMessage = async (msg: MailMessage) => {
    if (!email) return;

    if (msg.body || msg.htmlBody) {
      setSelectedMsg(msg as FullMessage);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return;
    }

    const customConfig = customNodes.find((n) => n.id === provider);

    setIsLoading(true);
    try {
      const res = (await fetchFromProvider(
        customConfig ? "custom" : provider,
        {
          action: "readMessage",
          id: msg.id,
          email,
          sid: sessionData?.sid,
          token: sessionData?.token,
        },
        customConfig,
      )) as ProviderRes;

      if (res.success) {
        setSelectedMsg({ ...res.message, id: msg.id });
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Decode Error" });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePin = (id: string | number) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleTestAndConnectNode = async () => {
    setIsTestingNode(true);
    try {
      const res = (await fetchFromProvider(
        "custom",
        { action: "genRandomMailbox" },
        newNode,
      )) as ProviderRes;

      if (res.success && res.email) {
        const inboxRes = (await fetchFromProvider(
          "custom",
          { action: "getMessages", email: res.email },
          newNode,
        )) as ProviderRes;

        if (inboxRes.success) {
          const finalNode = {
            ...newNode,
            id: `custom_${Date.now()}`,
            label: newNode.label || "Custom Server",
          };
          setCustomNodes((prev) => [...prev, finalNode]);
          setProvider(finalNode.id);
          setShowAddNode(false);
          toast({
            title: "Node Integrated",
            description: "Hardware handshake successful.",
          });
          generateMail(finalNode.id);
        } else {
          throw new Error("Inbox node unreachable.");
        }
      } else {
        throw new Error("Identity provisioning node failed.");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Api Connection Failed",
        description: err.message,
      });
    } finally {
      setIsTestingNode(false);
    }
  };

  const disconnectNode = (id: string) => {
    setCustomNodes((prev) => prev.filter((n) => n.id !== id));
    if (provider === id) setProvider(DEFAULT_PROVIDERS[0].id);
    toast({ title: "Node Decoupled" });
  };

  // --- 4. Logic Matrix ---
  const detectedOtp = useMemo(() => {
    if (!selectedMsg) return null;
    const searchTarget = selectedMsg.body + selectedMsg.htmlBody;
    const match = searchTarget.match(/\b\d{4,8}\b/);
    return match ? match[0] : null;
  }, [selectedMsg]);

  const filteredMessages = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = messages.filter(
      (m) =>
        m.from.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q),
    );

    return [...filtered].sort((a, b) => {
      const aPinned = pinnedIds.has(a.id);
      const bPinned = pinnedIds.has(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [messages, searchQuery, pinnedIds]);

  const handleDownload = (fmt: "html" | "eml") => {
    if (!selectedMsg) return;
    const content =
      fmt === "html"
        ? selectedMsg.htmlBody
        : `From: ${selectedMsg.from}\nSubject: ${selectedMsg.subject}\nDate: ${selectedMsg.date}\n\n${selectedMsg.body}`;
    const blob = new Blob([content], {
      type: fmt === "html" ? "text/html" : "message/rfc822",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email_${selectedMsg.id}.${fmt}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div className="flex flex-1 w-full overflow-hidden selection:bg-primary/20 relative">
      <div className="container mx-auto px-4 flex flex-col h-full">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start overflow-hidden pt-4 pb-12">
          {/* Left Column: Controls & History */}
          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700 overflow-y-auto custom-scrollbar h-full pr-2">
            <Card className="relative overflow-hidden rounded-[1.8rem] border border-border bg-card shadow-xl">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />

              <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/40 py-5">
                <CardTitle className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    <Server className="h-5 w-5" />
                  </span>
                  Matrix Config
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddNode(true)}
                  className="h-9 w-9 rounded-xl border border-blue-500/20 bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-7 pt-7">
                <div className="space-y-3">
                  <Label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">
                    <Globe className="h-3.5 w-3.5 text-sky-500" />
                    Active Servers
                  </Label>
                  <Select value={provider} onValueChange={handleProviderChange}>
                    <SelectTrigger className="h-14 rounded-2xl border-border bg-muted/50 text-[10px] font-bold uppercase tracking-widest">
                      <SelectValue placeholder="Choose Provider" />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      {allProviders.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                          className="text-[10px] font-black uppercase"
                        >
                          {p.label} {p.id.startsWith("custom_") && " (Custom)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {provider.startsWith("custom_") && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => disconnectNode(provider)}
                        className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-red-500 hover:underline"
                      >
                        <Unplug className="h-3 w-3" /> Disconnect
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">
                    <User className="h-3.5 w-3.5 text-violet-500" />
                    Custom Name (Optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={customUsername}
                      onChange={(e) =>
                        setCustomUsername(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, ""),
                        )
                      }
                      placeholder="prefix handle..."
                      className="h-12 rounded-xl border-border bg-muted/40 font-bold"
                    />
                    <Button
                      onClick={() => generateMail(provider, customUsername)}
                      disabled={!customUsername.trim() || isLoading}
                      className="h-12 rounded-xl bg-blue-600 px-5 text-[9px] font-black uppercase text-white"
                    >
                      Set
                    </Button>
                  </div>
                </div>

                <div className="relative flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-blue-500/20 bg-gradient-to-b from-blue-600/10 via-sky-500/5 to-muted/30 p-7 text-center">
                  <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">
                    <Mail className="h-3.5 w-3.5" />
                    Active Mailbox
                  </p>
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  ) : (
                    <h2 className="break-all font-headline text-lg font-black text-foreground select-all md:text-xl">
                      {email || "---"}
                    </h2>
                  )}
                  {unreadCount > 0 && (
                    <div className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[9px] font-black text-white">
                      {unreadCount}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    onClick={() => handleCopyText(email || "", "identity")}
                    disabled={!email}
                    className="h-12 rounded-2xl bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/25"
                  >
                    {isCopied === "identity" ? (
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                    ) : (
                      <Copy className="mr-2 h-5 w-5" />
                    )}
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => generateMail()}
                    className="h-12 rounded-2xl border-border bg-muted/40 text-[10px] font-black uppercase tracking-widest text-foreground hover:text-blue-600"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" /> Genrate New
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="flex max-h-[350px] flex-col overflow-hidden rounded-[1.8rem] border border-border bg-card shadow-xl">
              <div className="h-1 w-full shrink-0 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
              <CardHeader className="flex shrink-0 flex-row items-center justify-between border-b border-border bg-muted/40 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                    <History className="h-4 w-4" />
                  </span>
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-foreground">
                    History
                  </CardTitle>
                </div>
                <button
                  onClick={() => setHistory([])}
                  className="rounded-lg px-2 py-1 text-[9px] font-black uppercase text-foreground/35 hover:bg-red-500/10 hover:text-red-500"
                >
                  Clear
                </button>
              </CardHeader>
              <CardContent className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-0">
                {history.length === 0 ? (
                  <div className="space-y-2 py-12 text-center text-foreground/30">
                    <History className="mx-auto h-8 w-8" />
                    <p className="text-[9px] font-black uppercase tracking-widest">
                      No History
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {history.map((h, i) => (
                      <div
                        key={h.email + "-" + i}
                        className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-muted/50"
                      >
                        <div
                          className="min-w-0 flex-1 cursor-pointer"
                          onClick={() => {
                            setEmail(h.email);
                            setProvider(h.provider);
                          }}
                        >
                          <p className="truncate text-[11px] font-bold text-foreground">
                            {h.email}
                          </p>
                          <p className="text-[8px] font-black uppercase tracking-wider text-blue-600/70">
                            {h.provider}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopyText(h.email, `hist-${i}`)}
                          className="rounded-lg p-2 text-foreground/35 hover:bg-blue-600/10 hover:text-blue-600"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Registry & Reader */}
          <div className="lg:col-span-8 flex h-full flex-col space-y-8 overflow-hidden">
            <Card className="relative flex flex-1 flex-col overflow-hidden rounded-[1.8rem] border border-border bg-card shadow-xl">
              <div className="h-1 w-full shrink-0 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />

              <CardHeader className="flex shrink-0 flex-col gap-5 border-b border-border bg-muted/40 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                      <Inbox className="h-5 w-5" />
                    </span>
                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.28em] text-foreground">
                      Mail Box
                    </CardTitle>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchMessages()}
                    disabled={isRefreshing || !email}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 text-[10px] font-black uppercase tracking-widest text-foreground/70 hover:text-blue-600 disabled:opacity-40"
                  >
                    <RefreshCcw
                      className={
                        isRefreshing
                          ? "h-3.5 w-3.5 animate-spin"
                          : "h-3.5 w-3.5"
                      }
                    />
                    Sync
                  </button>
                  {messages.length > 0 && (
                    <Badge className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[8px] font-black text-white">
                      {messages.length} Mail
                    </Badge>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
                  <Input
                    placeholder="Filter by sender or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 rounded-xl border-border bg-muted/40 pl-11 text-sm"
                  />
                </div>
              </CardHeader>

              <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
                <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
                  {filteredMessages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 py-24 text-foreground/30">
                      <Inbox className="h-12 w-12 text-blue-600/40" />
                      <p className="text-xs font-black uppercase tracking-widest">
                        Inbox empty
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredMessages.map((msg) => {
                        const isPinned = pinnedIds.has(msg.id);
                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex cursor-pointer items-center",
                              isPinned ? "bg-blue-600/5" : "hover:bg-muted/50",
                            )}
                            onClick={() => readMessage(msg)}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4">
                              <div
                                className={cn(
                                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                                  isPinned
                                    ? "bg-blue-600/15 text-blue-600"
                                    : "border border-border bg-muted text-blue-600/50",
                                )}
                              >
                                <MessageSquare className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="truncate text-sm font-bold text-foreground">
                                  {msg.subject || "(No Subject)"}
                                </h4>
                                <p className="truncate text-[11px] text-foreground/50">
                                  {msg.from}
                                </p>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2 border-l border-border px-4 py-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePin(msg.id);
                                }}
                                className={cn(
                                  "rounded-xl p-2",
                                  isPinned
                                    ? "bg-blue-600/10 text-blue-600"
                                    : "text-foreground/35 hover:bg-muted hover:text-blue-600",
                                )}
                              >
                                {isPinned ? (
                                  <PinOff className="h-4 w-4" />
                                ) : (
                                  <Pin className="h-4 w-4" />
                                )}
                              </button>
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground/35">
                                <ArrowRight className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <section className="mx-auto mt-16 max-w-3xl px-4 pb-20">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
              <HelpCircle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Temp Mail FAQ
              </h2>
              <p className="text-sm text-foreground/55">
                Quick answers before you use the inbox
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "What is Temp Mail?",
                a: "A disposable email you can use to receive messages without your real address.",
                icon: Mail,
              },
              {
                q: "Is it free?",
                a: "Yes. My Kit Tool Temp Mail is free to use in your browser.",
                icon: CheckCircle2,
              },
              {
                q: "Do I need to sign up?",
                a: "No account is required to generate an address and read incoming mail.",
                icon: ShieldCheck,
              },
              {
                q: "Is it private?",
                a: "Use it for signups and one-time codes. Do not use it for banking or important accounts.",
                icon: Lock,
              },
            ].map((item) => (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
                <div className="flex gap-4 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {item.q}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/60">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Custom Node Modal */}
      <Dialog open={showAddNode} onOpenChange={setShowAddNode}>
        <DialogContent className="fixed left-1/2 top-[5.5rem] z-50 flex h-[min(36rem,calc(100vh-7rem))] w-[calc(100%-24px)] max-w-2xl -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card p-0 text-foreground translate-y-0">
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />

          <DialogHeader className="shrink-0 border-b border-border bg-muted/40 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-600/10 text-blue-600">
                <Settings className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-lg font-black tracking-tight text-foreground">
                  Add Custom Server
                </DialogTitle>
                <DialogDescription className="text-xs text-foreground/55">
                  Connect your own temp-mail API
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto bg-card p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                  Server Label
                </Label>
                <Input
                  value={newNode.label}
                  onChange={(e) =>
                    setNewNode({ ...newNode, label: e.target.value })
                  }
                  placeholder="e.g. My Secure Node"
                  className="h-11 rounded-xl border-border bg-muted/40 text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                  Base API URL
                </Label>
                <Input
                  value={newNode.baseUrl}
                  onChange={(e) =>
                    setNewNode({ ...newNode, baseUrl: e.target.value })
                  }
                  placeholder="https://api.temp.com"
                  className="h-11 rounded-xl border-border bg-muted/40 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                Endpoints
              </Label>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-foreground/45">
                    Create
                  </Label>
                  <Input
                    value={newNode.createUrl}
                    onChange={(e) =>
                      setNewNode({ ...newNode, createUrl: e.target.value })
                    }
                    placeholder="/new or {baseUrl}/generate"
                    className="h-11 rounded-xl border-border bg-muted/30 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-foreground/45">
                    Inbox
                  </Label>
                  <Input
                    value={newNode.inboxUrl}
                    onChange={(e) =>
                      setNewNode({ ...newNode, inboxUrl: e.target.value })
                    }
                    placeholder="/inbox?email={email}"
                    className="h-11 rounded-xl border-border bg-muted/30 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-foreground/45">
                    Read
                  </Label>
                  <Input
                    value={newNode.readUrl}
                    onChange={(e) =>
                      setNewNode({ ...newNode, readUrl: e.target.value })
                    }
                    placeholder="/message?id={id}"
                    className="h-11 rounded-xl border-border bg-muted/30 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                Response paths
              </Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Object.keys(newNode.paths).map((key) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-foreground/45">
                      {key}
                    </Label>
                    <Input
                      value={newNode.paths[key as keyof typeof newNode.paths]}
                      onChange={(e) =>
                        setNewNode({
                          ...newNode,
                          paths: { ...newNode.paths, [key]: e.target.value },
                        })
                      }
                      placeholder="e.g. data.email"
                      className="h-10 rounded-xl border-border bg-muted/30 font-mono text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                  Headers (JSON)
                </Label>
                <Input
                  value={newNode.headers}
                  onChange={(e) =>
                    setNewNode({ ...newNode, headers: e.target.value })
                  }
                  placeholder='{"Authorization":"Bearer ..."}'
                  className="h-11 rounded-xl border-border bg-muted/30 font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
                  API Key
                </Label>
                <Input
                  value={newNode.apiKey}
                  onChange={(e) =>
                    setNewNode({ ...newNode, apiKey: e.target.value })
                  }
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-border bg-muted/30 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-border bg-muted/40 p-4">
            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddNode(false)}
                className="h-11 flex-1 rounded-xl border-border text-[10px] font-black uppercase"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTestAndConnectNode}
                disabled={isTestingNode}
                className="h-11 flex-[2] rounded-xl bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white"
              >
                {isTestingNode ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Test & Connect
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Modal */}

      <Dialog open={!!selectedMsg} onOpenChange={() => setSelectedMsg(null)}>
        <DialogContent className="fixed left-1/2 top-[5.5rem] z-50 flex h-[min(42rem,calc(100vh-7rem))] w-[calc(100%-24px)] max-w-4xl -translate-x-1/2 translate-y-0 flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-2xl [&>button]:hidden">
          {selectedMsg && (
            <>
              <DialogTitle className="sr-only">
                {selectedMsg.subject || "Email"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                From {selectedMsg.from || "unknown"}
              </DialogDescription>

              <div className="h-1 shrink-0 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />

              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                    {(selectedMsg.from || "M")
                      .toString()
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-[17px] font-bold leading-tight text-foreground">
                      {selectedMsg.subject || "(No subject)"}
                    </h2>
                    <p className="mt-1 truncate text-[13px] text-foreground/70">
                      {selectedMsg.from || "Unknown sender"}
                    </p>
                    {selectedMsg.date ? (
                      <p className="mt-0.5 text-[11px] text-foreground/45">
                        {selectedMsg.date}
                      </p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMsg(null)}
                  className="rounded-lg p-2 text-foreground/40 hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 bg-[#f8fafc]">
                <iframe
                  title="email-body"
                  sandbox="allow-same-origin allow-popups"
                  className="h-full w-full border-0 bg-white"
                  srcDoc={
                    "<!DOCTYPE html><html><head><meta charset='utf-8'><style>body{margin:20px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#202124}img{max-width:100%}</style></head><body>" +
                    String(
                      (selectedMsg as any).html ||
                        (selectedMsg as any).bodyHtml ||
                        (selectedMsg as any).body ||
                        (selectedMsg as any).message ||
                        (selectedMsg as any).text ||
                        "<p>No message body</p>",
                    ) +
                    "</body></html>"
                  }
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
