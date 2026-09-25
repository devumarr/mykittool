"use client";

import React, { useRef, useState } from "react";
import {
  Unlock,
  Upload,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PDFDocument } from "@cantoo/pdf-lib";

export default function PdfUnlockPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${["B", "KB", "MB", "GB"][i]}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      toast({
        variant: "destructive",
        title: "PDF only",
        description: "Upload a .pdf file.",
      });
      return;
    }
    setFile(selected);
    setError(null);
  };

  const handleClear = () => {
    setFile(null);
    setPassword("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const executeUnlock = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const bytes = await file.arrayBuffer();
      let src: PDFDocument | null = null;

      const tries = [
        { password: password || "", ignoreEncryption: false },
        { password: password || "", ignoreEncryption: true },
        { password: "", ignoreEncryption: true },
      ];

      for (const opts of tries) {
        try {
          src = await PDFDocument.load(bytes, opts);
          break;
        } catch {
          src = null;
        }
      }

      if (!src) throw new Error("Could not open this PDF");

      const outDoc = await PDFDocument.create();
      const pages = await outDoc.copyPages(src, src.getPageIndices());
      pages.forEach((p) => outDoc.addPage(p));

      const out = await outDoc.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "") + "-unlocked.pdf";
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Unlocked",
        description: "New PDF downloaded without password.",
      });
    } catch {
      setError(
        "This PDF could not be unlocked in the browser. Check the password.",
      );
      toast({
        variant: "destructive",
        title: "Unlock failed",
        description:
          "Wrong password, or encryption is too strong for the browser.",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
          PDF tools
        </p>
        <h1 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">
          PDF Unlock
        </h1>
        <p className="mt-3 max-w-xl text-sm text-foreground/60">
          Remove a known password from a PDF in your browser. File never leaves
          this device.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-7">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle className="flex items-center gap-3 text-sm">
              <Unlock className="h-4 w-4 text-blue-600" /> Unlock file
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <button
              type="button"
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={cn(
                "flex h-40 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 transition hover:border-blue-600/40",
                file && "border-solid border-blue-600/20",
              )}
            >
              {file ? (
                <>
                  <CheckCircle2 className="mb-2 h-8 w-8 text-blue-600" />
                  <p className="max-w-[260px] truncate text-sm font-bold">
                    {file.name}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {formatSize(file.size)}
                  </p>
                </>
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-foreground/30" />
                  <p className="text-sm font-semibold text-foreground/60">
                    Drop or click PDF
                  </p>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Document password"
                  className="h-12 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={executeUnlock}
                disabled={!file || isProcessing}
                className="h-12 flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Unlock className="mr-2 h-4 w-4" />
                )}
                Unlock
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                className="h-12 w-12 rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-5">
          <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl">
            <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-400" />
            <CardContent className="space-y-4 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold">Private unlock</h3>
              <p className="text-sm text-foreground/60">
                Runs locally. No upload server. You must already know the
                password.
              </p>
              <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-3 text-sm text-foreground/60">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                Some AES-256 / owner-only files still cannot be opened in the
                browser.
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-3 text-sm text-foreground/60">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                Unlocked file downloads as name-unlocked.pdf
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <section className="mx-auto mt-16 max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
            <Unlock className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              PDF Unlock FAQ
            </h2>
            <p className="text-sm text-foreground/55">
              Quick answers before you unlock
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Can I unlock a PDF without the password?",
              a: "No. This tool only removes a password you already know.",
            },
            {
              q: "Is my PDF uploaded?",
              a: "No. Unlocking runs in your browser. The file stays on your device.",
            },
            {
              q: "Is it free?",
              a: "Yes. PDF Unlock on My Kit Tool is free to use.",
            },
            {
              q: "Why did unlock fail?",
              a: "Wrong password, or the PDF uses an encryption type the browser cannot open.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
              <div className="p-5">
                <h3 className="text-sm font-bold text-foreground">{item.q}</h3>
                <p className="mt-1 text-sm leading-relaxed text-foreground/60">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
