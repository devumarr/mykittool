"use client";

import React, { useRef, useState } from "react";
import {
  Lock,
  Upload,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Printer,
  Copy,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PDFDocument } from "@cantoo/pdf-lib";

export default function PdfPasswordProtectPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

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
      toast({ variant: "destructive", title: "PDF only" });
      return;
    }
    setFile(selected);
  };

  const handleClear = () => {
    setFile(null);
    setPassword("");
    setConfirmPassword("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const executeProtection = async () => {
    if (!file) return;
    if (password.length < 4) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Use at least 4 characters.",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }

    setIsProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

      await (pdfDoc as any).encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: {
          printing: allowPrinting ? "highResolution" : false,
          copying: allowCopying,
          modifying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: true,
          documentAssembly: false,
        },
      });

      const out = await pdfDoc.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "") + "-protected.pdf";
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Protected",
        description: "Open the file — it will ask for the password.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Lock failed",
        description: "This PDF could not be encrypted in the browser.",
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
        <h1 className="text-3xl font-black tracking-tight md:text-5xl">
          PDF Password Protect
        </h1>
        <p className="mt-3 max-w-xl text-sm text-foreground/60">
          Add a real open-password to a PDF in your browser. File never leaves
          this device.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-7">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle className="flex items-center gap-3 text-sm">
              <Lock className="h-4 w-4 text-blue-600" /> Lock file
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <button
              type="button"
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={cn(
                "flex h-40 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 hover:border-blue-600/40",
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl pr-12"
                    placeholder="Set password"
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
              <div className="space-y-2">
                <Label>Confirm</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "h-12 rounded-xl",
                    confirmPassword &&
                      password !== confirmPassword &&
                      "border-red-500",
                  )}
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Printer className="h-4 w-4 text-blue-600" /> Allow print
                </span>
                <Switch
                  checked={allowPrinting}
                  onCheckedChange={setAllowPrinting}
                />
              </label>
              <label className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Copy className="h-4 w-4 text-blue-600" /> Allow copy
                </span>
                <Switch
                  checked={allowCopying}
                  onCheckedChange={setAllowCopying}
                />
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={executeProtection}
                disabled={
                  !file ||
                  isProcessing ||
                  !password ||
                  password !== confirmPassword
                }
                className="h-12 flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Protect PDF
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

        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-5">
          <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-400" />
          <CardContent className="space-y-4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold">Real password lock</h3>
            <p className="text-sm text-foreground/60">
              Uses AES encryption in the browser. Opening the file should ask
              for this password.
            </p>
            <div className="flex gap-3 rounded-xl bg-muted/50 p-3 text-sm text-foreground/60">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              Remember the password. It cannot be recovered here.
            </div>
            <div className="flex gap-3 rounded-xl bg-muted/50 p-3 text-sm text-foreground/60">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              Already-locked PDFs may fail. Unlock first, then protect again.
            </div>
          </CardContent>
        </Card>
      </div>
      <section className="mx-auto mt-16 max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold">PDF Password FAQ</h2>
            <p className="text-sm text-foreground/55">
              How PDF lock works here
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            {
              q: "Does the PDF really get a password?",
              a: "Yes. After Protect PDF, opening the file should ask for the password you set.",
            },
            {
              q: "Is my file uploaded?",
              a: "No. Encryption runs in your browser. The PDF stays on your device.",
            },
            {
              q: "Is it free?",
              a: "Yes. PDF Password Protect on My Kit Tool is free.",
            },
            {
              q: "What if I forget the password?",
              a: "It cannot be recovered here. Save the password before you lock the file.",
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
<div>
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
</div>;
