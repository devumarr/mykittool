"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Maximize2,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  Settings2,
  Zap,
  Activity,
  ShieldCheck,
  ImageIcon,
  ArrowRightLeft,
  Scaling,
  RotateCcw,
  Lock,
  Unlock,
  Save,
  Loader2,
  FileImage,
  Maximize,
  Ratio,
  ChevronRight,
  Badge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GetHelp } from "@/components/mykittool/get-help";

const PRESETS = [
  { label: "Social OG (1200×630)", w: 1200, h: 630 },
  { label: "Insta Square (1080×1080)", w: 1080, h: 1080 },
  { label: "YouTube HD (1280×720)", w: 1280, h: 720 },
  { label: "Desktop FHD (1920×1080)", w: 1920, h: 1080 },
  { label: "Favicon (512×512)", w: 512, h: 512 },
];

export default function ImageSizeConverterPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [originalMeta, setOriginalMeta] = useState<{
    width: number;
    height: number;
    name: string;
    size: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings
  const [targetWidth, setTargetWidth] = useState<number>(1200);
  const [targetHeight, setTargetHeight] = useState<number>(630);
  const [lockRatio, setLockRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1200 / 630);
  const [outputFormat, setOutputFormat] = useState<
    "image/png" | "image/jpeg" | "image/webp"
  >("image/png");
  const [quality, setQuality] = useState(90);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const img = new Image();
        img.onload = () => {
          setOriginalMeta({
            width: img.width,
            height: img.height,
            name: file.name,
            size: file.size,
          });
          setImage(result);
          setTargetWidth(img.width);
          setTargetHeight(img.height);
          setAspectRatio(img.width / img.height);
          toast({
            title: "Asset Imported",
            description: `${img.width}x${img.height} matrix decoded.`,
          });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const updateWidth = (w: number) => {
    setTargetWidth(w);
    if (lockRatio && w > 0) {
      setTargetHeight(Math.round(w / aspectRatio));
    }
  };

  const updateHeight = (h: number) => {
    setTargetHeight(h);
    if (lockRatio && h > 0) {
      setTargetWidth(Math.round(h * aspectRatio));
    }
  };

  const handleDownload = () => {
    if (!image || !targetWidth || !targetHeight) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (outputFormat === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const dataUrl = canvas.toDataURL(outputFormat, quality / 100);
      const link = document.createElement("a");
      const ext = outputFormat.split("/")[1].replace("jpeg", "jpg");
      link.download = `resized_${originalMeta?.name.split(".")[0] || "studio"}.${ext}`;
      link.href = dataUrl;
      link.click();

      setIsProcessing(false);
      toast({
        title: "Master Exported",
        description: "Converted asset saved to local storage.",
      });
    };
  };

  const handleClear = () => {
    setImage(null);
    setOriginalMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Maximize2 className="w-3.5 h-3.5" /> High-Fidelity Studio
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
              Image Size <span className="text-primary italic">Converter</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Resize and convert images in one click. Professional local-only
              re-matricing with precision geometry control and multi-format
              encoding protocols.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <GetHelp toolId="image-size-converter" />
            {image && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="py-6 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> EDITOR
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <div
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    image && "border-solid border-primary/20",
                    isProcessing && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {image ? (
                    <div className="text-center p-6 space-y-2">
                      <ImageIcon className="w-10 h-10 text-primary mx-auto mb-2" />
                      <p className="text-xs font-black uppercase text-foreground truncate max-w-[240px]">
                        {originalMeta?.name}
                      </p>
                      <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                        {originalMeta?.width}x{originalMeta?.height} detected
                      </p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-14 h-14 rounded-[1.2rem] bg-background border border-border flex items-center justify-center text-foreground/10 group-hover:text-primary transition-all mx-auto shadow-xl">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">
                        Import
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Dimensions Matrix */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">
                    Target Geometry (px)
                  </Label>
                  <div className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full border border-border">
                    {lockRatio ? (
                      <Lock className="w-3 h-3 text-primary" />
                    ) : (
                      <Unlock className="w-3 h-3 text-foreground/20" />
                    )}
                    <span className="text-[8px] font-black uppercase text-foreground/40">
                      Lock
                    </span>
                    <Switch
                      checked={lockRatio}
                      onCheckedChange={setLockRatio}
                      className="scale-75 h-4"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 relative">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-foreground/20 uppercase ml-1">
                      Width
                    </Label>
                    <Input
                      type="number"
                      value={targetWidth || ""}
                      onChange={(e) =>
                        updateWidth(parseInt(e.target.value) || 0)
                      }
                      className="h-14 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-foreground/20 uppercase ml-1">
                      Height
                    </Label>
                    <Input
                      type="number"
                      value={targetHeight || ""}
                      onChange={(e) =>
                        updateHeight(parseInt(e.target.value) || 0)
                      }
                      className="h-14 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40"
                    />
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 mt-1 opacity-20 pointer-events-none">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                </div>

                {/* Presets Grid */}
                <div className="relative">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const p = PRESETS.find((x) => x.label === e.target.value);
                      if (!p) return;
                      setLockRatio(false);
                      setTargetWidth(p.w);
                      setTargetHeight(p.h);
                      setAspectRatio(p.w / p.h);
                      setLockRatio(true);
                      toast({ title: "Preset Applied" });
                    }}
                    className="h-14 w-full appearance-none rounded-2xl border border-border bg-secondary/40 px-5 pr-12 text-[11px] font-black uppercase tracking-[0.18em] text-foreground shadow-sm outline-none transition-all hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="" disabled>
                      Choose size preset
                    </option>
                    {PRESETS.map((p) => (
                      <option key={p.label} value={p.label}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  </span>
                </div>
              </div>

              {/* Export Logic */}
              <div className="space-y-6 pt-6 border-t border-white/5">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">
                    Format
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["PNG", "JPG", "WebP"].map((f) => (
                      <button
                        key={f}
                        onClick={() =>
                          setOutputFormat(
                            `image/${f.toLowerCase() === "jpg" ? "jpeg" : f.toLowerCase()}` as any,
                          )
                        }
                        className={cn(
                          "h-11 rounded-xl border text-[9px] font-black uppercase transition-all",
                          outputFormat.includes(
                            f.toLowerCase().replace("jpg", "jpeg"),
                          )
                            ? "bg-primary text-white border-primary shadow-lg"
                            : "bg-background border-border text-foreground/40 hover:text-foreground",
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {outputFormat !== "image/png" && (
                  <div className="space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/30">
                      <Label>Encoding Quality</Label>
                      <span className="text-primary font-mono">{quality}%</span>
                    </div>
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
                  onClick={handleDownload}
                  disabled={!image || isProcessing}
                  className="h-16 w-full bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                  ) : (
                    <Save className="w-5 h-5 mr-3" />
                  )}
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Results Matrix - Right */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-background/10">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0 px-6 sm:px-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Activity className="w-5 h-5" />
                </div>
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">
                  Live
                </CardTitle>
              </div>
              {originalMeta && (
                <div className="hidden sm:flex gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase">
                    Source: {originalMeta.width}x{originalMeta.height}
                  </Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-black uppercase">
                    Target: {targetWidth}x{targetHeight}
                  </Badge>
                </div>
              )}
            </CardHeader>

            <CardContent className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden bg-checkered">
              {!image ? (
                <div className="flex flex-col items-center justify-center opacity-10 gap-6 py-20 grayscale pointer-events-none">
                  <ImageIcon className="w-24 h-24 text-primary" />
                  <p className="text-xl font-headline font-black uppercase tracking-[0.4em]">
                    Signal
                  </p>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-500">
                  <div
                    className="relative shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/10 bg-white"
                    style={{
                      width: "100%",
                      maxWidth: "600px",
                      aspectRatio: `${targetWidth}/${targetHeight}`,
                    }}
                  >
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Safe Zone / Resolution Badge */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-md border border-white/10 text-white text-[8px] font-black uppercase tracking-widest shadow-xl">
                        {targetWidth} × {targetHeight} PX
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <div className="p-8 border-t border-white/5 bg-[#0a0a0c] grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary/50 border border-border group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">
                    Privacy
                  </h4>
                  <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Synthesis occurs 100% locally. Your visual matrices are
                    never transmitted or stored on remote servers.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
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
        .bg-checkered {
          background-image:
            linear-gradient(45deg, #111113 25%, transparent 25%),
            linear-gradient(-45deg, #111113 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #111113 75%),
            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
