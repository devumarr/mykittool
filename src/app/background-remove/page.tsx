"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Eraser,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Zap,
  Activity,
  Settings2,
  ShieldCheck,
  KeyRound,
  Unplug,
  AlertTriangle,
  RefreshCcw,
  RotateCcw,
  Maximize2,
  ImageIcon,
  Save,
  ArrowRight,
  X,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GetHelp } from "@/components/mykittool/get-help";
import { useUser } from "@/firebase";
import { removeBackground, testRemoveBgKey } from "./actions";
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
import Link from "next/link";

export default function BackgroundRemovePage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();

  // Intake State
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);

  // Custom Node State
  const [showCustomNode, setShowCustomNode] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [isTestingNode, setIsTestingNode] = useState(false);
  const [activeNode, setActiveNode] = useState<{
    key: string;
    label: string;
  } | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // UI Meta
  const [showOriginal, setShowOriginal] = useState(false);
  const [compareSplit, setCompareSplit] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Persistence Matrix ---
  useEffect(() => {
    if (user) {
      const savedNode = localStorage.getItem(`mykit_removebg_node_${user.uid}`);
      if (savedNode) {
        try {
          setActiveNode(JSON.parse(savedNode));
        } catch (e) {}
      }
    }
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Heavy Payload",
          description: "Standard limit is 10MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setLocalError(null);
        toast({ title: "Asset Buffered" });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const executeExtraction = async () => {
    if (!image) {
      toast({
        variant: "destructive",
        title: "Protocol Failure",
        description: "Please select an image first.",
      });
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Auth Required",
        description: "Please sign in to process visuals.",
      });
      return;
    }

    setIsProcessing(true);
    setLocalError(null);

    try {
      const response = await removeBackground(image, activeNode?.key);

      if (response.success && response.data) {
        setResult(response.data);
        toast({
          title: "Extraction Success",
          description: "Background matrix neutralized.",
        });
      } else {
        throw new Error(response.error || "Uplink restricted by remote node.");
      }
    } catch (err: any) {
      setLocalError(err.message || "Protocol Failure.");
      toast({ variant: "destructive", title: "Handshake Failed" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestAndConnect = async () => {
    if (!customKey.trim()) return;
    setIsTestingNode(true);
    setLocalError(null);

    try {
      const res = await testRemoveBgKey(customKey.trim());
      if (res.success) {
        const node = {
          key: customKey.trim(),
          label: "Custom Node",
        };
        setActiveNode(node);
        localStorage.setItem(
          `mykit_removebg_node_${user?.uid}`,
          JSON.stringify(node),
        );
        setShowCustomNode(false);
        setCustomKey("");
        toast({
          title: "Host Node Active",
          description: `Credits remaining: ${res.credits}`,
        });
      } else {
        setLocalError(res.error || "Handshake Failed");
        toast({
          variant: "destructive",
          title: "Handshake Failed",
          description: res.error,
        });
      }
    } catch (e) {
      setLocalError("Protocol Error: Discovery node unreachable.");
      toast({ variant: "destructive", title: "Protocol Error" });
    } finally {
      setIsTestingNode(false);
    }
  };

  const disconnectNode = () => {
    setActiveNode(null);
    localStorage.removeItem(`mykit_removebg_node_${user?.uid}`);
    setCustomKey("");
    toast({ title: "Default Node Restored" });
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.download = `sanitized_${Date.now()}.png`;
    link.href = result;
    link.click();
    toast({ title: "Master Exported" });
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
    setLocalError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast({ title: "Studio Reset" });
  };
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (isProcessing || !e.dataTransfer.files?.length) return;
    handleFileUpload({
      target: { files: e.dataTransfer.files },
    } as React.ChangeEvent<HTMLInputElement>);
  }
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-primary">
            IMAGE TOOLS
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Background Remover
          </h1>
          <p className="mt-2 max-w-xl text-sm text-foreground/70">
            Cut out a subject and download a transparent PNG.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setLocalError(null);
              setCustomKey("");
              setShowCustomNode(true);
            }}
          >
            {activeNode ? "API key connected" : "Add API key"}
          </Button>
          {(image || result) && (
            <Button variant="outline" onClick={handleClear}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {showCustomNode && (
        <Card className="mt-4 border">
          <CardHeader className="py-4">
            <CardTitle className="text-sm">API key</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              type="password"
              placeholder="Paste API key"
            />
            <Button
              onClick={handleTestAndConnect}
              disabled={isTestingNode || !customKey}
            >
              {isTestingNode ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Connect
            </Button>
            {activeNode && (
              <Button
                variant="outline"
                onClick={() => setShowDisconnectConfirm(true)}
              >
                Disconnect
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-sm">Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                if (!isProcessing) setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "flex h-56 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed text-center",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border bg-secondary/30",
                isProcessing && "cursor-not-allowed opacity-60",
              )}
            >
              {image ? (
                <img
                  src={image}
                  alt="Selected photo"
                  className="max-h-52 w-auto object-contain"
                />
              ) : (
                <div>
                  <Upload className="mx-auto mb-2 h-6 w-6 text-foreground/40" />
                  <p className="text-sm font-medium">
                    Drop a photo here, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-foreground/45">JPG or PNG</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <Button
              onClick={executeExtraction}
              disabled={isProcessing || !image}
              className="h-11 w-full"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Remove background
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-foreground/55">
              A plain wall and light on the face give a cleaner edge. Download
              PNG to keep transparency.
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="border-b py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Result</CardTitle>
              {result && (
                <label className="flex items-center gap-2 text-xs text-foreground/60">
                  Compare
                  <Switch
                    checked={showOriginal}
                    onCheckedChange={setShowOriginal}
                  />
                </label>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div
              className="flex h-72 items-center justify-center rounded-xl border p-3"
              style={{
                backgroundImage:
                  "linear-gradient(45deg,#e5e5e5 25%,transparent 25%),linear-gradient(-45deg,#e5e5e5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e5e5 75%),linear-gradient(-45deg,transparent 75%,#e5e5e5 75%)",
                backgroundSize: "16px 16px",
                backgroundColor: "#fff",
              }}
            >
              {isProcessing ? (
                <p className="text-sm text-foreground/60">
                  Removing background...
                </p>
              ) : result || image ? (
                <img
                  src={showOriginal ? image! : result || image!}
                  alt="Background removed preview"
                  className="max-h-64 w-auto object-contain"
                />
              ) : (
                <p className="text-sm text-foreground/45">
                  The cutout will show here.
                </p>
              )}
            </div>
            {result && (
              <Button onClick={handleDownload} className="h-11 w-full">
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="mx-auto mt-14 max-w-3xl border-t pt-10">
        <p className="text-xs font-semibold tracking-wide text-primary">
          GUIDE
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Remove a background from a photo
        </h2>
        <p className="mt-3 text-sm leading-7 text-foreground/75">
          A background remover cuts the person or object out of a picture so you
          can place it on a plain color, a shop listing, or a slide. The hard
          part is the edge: hair, glasses, and a collar that is the same color
          as the wall. A clean source photo does more than any slider.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border p-4">
            <p className="text-sm font-medium">1. Add the photo</p>
            <p className="mt-1 text-xs leading-5 text-foreground/60">
              Drop a JPG or PNG, or click the box. A plain wall works better
              than a street.
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm font-medium">2. Remove the background</p>
            <p className="mt-1 text-xs leading-5 text-foreground/60">
              Press Remove background. The checkerboard means that area is
              transparent.
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm font-medium">3. Download PNG</p>
            <p className="mt-1 text-xs leading-5 text-foreground/60">
              PNG keeps the empty area empty. JPG will fill it with a color.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3 text-sm leading-7 text-foreground/75">
          <h2 className="text-lg font-semibold text-foreground">
            How to get a cleaner cut
          </h2>
          <p>
            Stand away from the wall. Use even light on the face, not a window
            behind the head. Avoid a shirt that matches the background. A busy
            market photo leaves specks around the hair. A light gray or white
            wall usually does not. After the cut, zoom the hair. A gray halo
            means the light was behind the subject. Take the photo again facing
            the light, then run it once more.
          </p>
          <p>
            Download PNG when you still need a transparent background, for a
            logo lockup, a thumbnail, or a slide. JPG cannot store transparency,
            so that export paints the empty pixels. For a product listing, put
            the cutout on white yourself and export JPG at the size the shop
            asks for. For a CV photo, white is the usual background. Do not
            leave the checkerboard in the file you send. That pattern is only
            the preview.
          </p>
          <h2 className="pt-2 text-lg font-semibold text-foreground">
            What this should not be used for
          </h2>
          <p>
            A passport, visa, or exam photo often must be unedited, on a set
            background, at a set size. Removing the background can get that file
            rejected even if the face looks fine. Read the form before you cut
            anything. If the form allows a plain background, cut the photo,
            place it on that exact color, and export at the pixel size they
            wrote.
          </p>
          <p>
            Use a picture you have the right to edit. A logo you do not own, or
            a photo of someone who did not agree, should not be cut out and
            republished. Crop out account numbers and chat text before you
            download. This page needs a Api key for the cut itself. The key’s
            quota is the limit, not a hidden fee on the page.
          </p>
          <h2 className="pt-2 text-lg font-semibold text-foreground">
            After you download
          </h2>
          <p>
            Open the PNG on a white page and on a dark page. If the edge only
            looks clean on one of them, the halo is still there. Run a tighter
            source photo instead of stacking filters. One good cut is better
            than three passes on a bad one. Close the tab when you are done so
            the preview leaves the page.
          </p>
        </div>

        <h2 className="mt-10 text-lg font-semibold">Background remover FAQ</h2>
        <div className="mt-3 divide-y rounded-xl border px-4">
          <div className="py-4">
            <p className="font-medium">Is background removal free?</p>
            <p className="mt-1 text-sm text-foreground/70">
              The page is free to open. The cut uses a Api key, so the number of
              photos follows that key’s quota.
            </p>
          </div>
          <div className="py-4">
            <p className="font-medium">
              Which file keeps the transparent background?
            </p>
            <p className="mt-1 text-sm text-foreground/70">
              PNG. JPG fills the empty area with a color, so download PNG if you
              still need transparency.
            </p>
          </div>
          <div className="py-4">
            <p className="font-medium">Why is the hair edge messy?</p>
            <p className="mt-1 text-sm text-foreground/70">
              A busy background or light behind the subject leaves a halo. A
              plain wall and light on the face cut cleaner.
            </p>
          </div>
          <div className="py-4">
            <p className="font-medium">Can I use this for a passport photo?</p>
            <p className="mt-1 text-sm text-foreground/70">
              Only if the form allows an edited photo. Many ID and visa forms
              want an unedited picture on a set background.
            </p>
          </div>
          <div className="py-4">
            <p className="font-medium">What does the checkerboard mean?</p>
            <p className="mt-1 text-sm text-foreground/70">
              It is the preview for transparent pixels. It is not part of the
              downloaded PNG.
            </p>
          </div>
        </div>
      </section>

      <AlertDialog
        open={showDisconnectConfirm}
        onOpenChange={setShowDisconnectConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect API key?</AlertDialogTitle>
            <AlertDialogDescription>
              The saved Api Key will be removed from this browser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                disconnectNode();
                setShowDisconnectConfirm(false);
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
