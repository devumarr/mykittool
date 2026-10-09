"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FileImage,
  Settings2,
  Download,
  Trash2,
  Upload,
  CheckCircle2,
  Info,
  Loader2,
  Maximize,
  Save,
  Zap,
  ArrowDownCircle,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ImageCompressorPage() {
  const { toast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
    type: string;
  } | null>(null);
  const [compressedSize, setCompressedCompressedSize] = useState<number | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState<number | "">("");
  const [format, setOutputFormat] = useState<
    "image/jpeg" | "image/webp" | "image/png"
  >("image/jpeg");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "High Volume Asset",
          description: "Files over 20MB may impact browser stability.",
        });
      }
      setFileInfo({ name: file.name, size: file.size, type: file.type });

      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setCompressedImage(null);
        setCompressedCompressedSize(null);
        toast({
          title: "Asset Imported",
          description: "Ready for studio optimization.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = useCallback(async () => {
    if (!originalImage) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = originalImage;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let width = img.width;
      let height = img.height;

      // Handle resizing if maxWidth is set
      if (maxWidth && width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL(format, quality / 100);
      setCompressedImage(compressedDataUrl);

      // Estimate compressed size from data URL
      const stringLength = compressedDataUrl.split(",")[1].length;
      const sizeInBytes = Math.floor(stringLength * (3 / 4));
      setCompressedCompressedSize(sizeInBytes);

      setIsProcessing(false);
      toast({
        title: "Optimization Complete",
        description: "Image compressed locally in your browser.",
      });
    };
  }, [originalImage, quality, maxWidth, format, toast]);

  const handleDownload = () => {
    if (!compressedImage) return;
    const link = document.createElement("a");
    const ext = format.split("/")[1];
    link.download = `optimized-${fileInfo?.name.split(".")[0] || "studio-asset"}.${ext}`;
    link.href = compressedImage;
    link.click();
    toast({
      title: "Export Success",
      description: "Optimized asset saved to your device.",
    });
  };

  const handleClear = () => {
    setOriginalImage(null);
    setCompressedImage(null);
    setFileInfo(null);
    setCompressedCompressedSize(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast({ title: "Studio Reset", description: "All fields cleared." });
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
      <p className="text-xs font-semibold tracking-wide text-primary">
        IMAGE TOOLS
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
        Image Compressor
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-foreground/70">
        Shrink a JPG, PNG, or WebP in the browser. The file stays on this
        device.
      </p>

      <div className="mt-6 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader className="border-b py-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileImage className="h-4 w-4 text-primary" />
              Source
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <div
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                if (!isProcessing) setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "flex h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 text-center transition-colors",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border bg-secondary/30",
                originalImage && "border-solid border-primary/30",
                isProcessing && "cursor-not-allowed opacity-70",
              )}
            >
              {originalImage ? (
                <>
                  <ImageIcon className="mb-2 h-8 w-8 text-primary" />
                  <p className="max-w-[260px] truncate text-sm font-medium">
                    {fileInfo?.name}
                  </p>
                  <p className="mt-1 text-xs text-foreground/50">
                    {formatSize(fileInfo?.size || 0)}
                  </p>
                </>
              ) : (
                <>
                  <Upload className="mb-2 h-6 w-6 text-foreground/40" />
                  <p className="text-sm font-medium">
                    Drop an image here, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-foreground/45">
                    JPG, PNG, WebP
                  </p>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label>Quality</Label>
                <span className="font-medium text-primary">{quality}%</span>
              </div>
              <Slider
                value={[quality]}
                min={10}
                max={100}
                step={1}
                onValueChange={(v) => setQuality(v[0])}
              />
              <p className="text-xs text-foreground/50">
                PNG stays lossless and ignores this slider.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Max width</Label>
                <Input
                  type="number"
                  placeholder="1920"
                  value={maxWidth}
                  onChange={(e) =>
                    setMaxWidth(
                      e.target.value === "" ? "" : parseInt(e.target.value),
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Format</Label>
                <Select
                  value={format}
                  onValueChange={(val: any) => setOutputFormat(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/jpeg">JPG</SelectItem>
                    <SelectItem value="image/webp">WebP</SelectItem>
                    <SelectItem value="image/png">PNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={compressImage}
                disabled={!originalImage || isProcessing}
                className="h-11 flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Compress
              </Button>
              <Button
                variant="outline"
                className="h-11"
                onClick={handleClear}
                aria-label="Clear"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-foreground/55">
              The image is processed on this device and is not uploaded.
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="border-b py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Preview</CardTitle>
              {compressedSize ? (
                <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {Math.max(
                    0,
                    Math.round(
                      (1 - compressedSize / (fileInfo?.size || 1)) * 100,
                    ),
                  )}
                  % smaller
                </span>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="flex h-[calc(100%-57px)] flex-col gap-4 pt-5">
            <div className="flex h-72 items-center justify-center rounded-xl border bg-secondary/20 p-4">
              {compressedImage ? (
                <img
                  src={compressedImage}
                  alt="Compressed preview"
                  className="max-h-72 w-auto object-contain"
                />
              ) : (
                <p className="text-sm text-foreground/45">
                  {originalImage
                    ? "Press Compress to preview the result."
                    : "Drop an image to start."}
                </p>
              )}
            </div>
            {compressedImage ? (
              <>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border px-3 py-2">
                    <p className="text-xs text-foreground/50">Original</p>
                    <p className="font-medium">
                      {formatSize(fileInfo?.size || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg border px-3 py-2">
                    <p className="text-xs text-foreground/50">Compressed</p>
                    <p className="font-medium">
                      {formatSize(compressedSize || 0)}
                    </p>
                  </div>
                </div>
                <Button onClick={handleDownload} className="h-11 w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
      <section className="col-span-full w-full basis-full">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <p className="text-xs font-semibold tracking-[0.18em] text-blue-600">
            IMAGE TOOLS
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">
            Image Compressor
          </h2>
          <p className="mt-2 max-w-xl text-neutral-600">
            Shrink JPG, PNG, and WebP in the browser. Nothing is uploaded.
          </p>

          <div className="mt-8 rounded-2xl border bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Image compressor FAQ
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Size, quality, and what stays on your device
            </p>
            <div className="mt-4 divide-y">
              <div className="py-4">
                <p className="font-medium text-neutral-900">
                  Is image compression free?
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  Yes. Compress images on My Kit Tool at no cost.
                </p>
              </div>
              <div className="py-4">
                <p className="font-medium text-neutral-900">
                  Do you upload my photo?
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  No. Compression runs in your browser. The file stays on your
                  device.
                </p>
              </div>
              <div className="py-4">
                <p className="font-medium text-neutral-900">
                  Why is the PNG still large?
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  PNG keeps sharp edges, so logos and screenshots stay bigger
                  than photos. Export JPG or WebP for a camera photo.
                </p>
              </div>
              <div className="py-4">
                <p className="font-medium text-neutral-900">
                  Will this make a blurry photo sharp?
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  No. It only reduces file size. Detail that was not in the
                  original cannot be added.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto mt-14 max-w-3xl border-t pt-10">
        <p className="text-xs font-semibold tracking-wide text-primary">
          GUIDE
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Compress an image without uploading it
        </h2>
        <p className="mt-3 text-sm leading-7 text-foreground/75">
          A photo from a phone is often 3 to 8 MB. Email, WhatsApp, and
          application forms reject that size, and a page full of heavy pictures
          loads slowly. This compressor shrinks the file in your browser. The
          image is not sent to a server, and you do not need an account.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border p-4">
            <p className="text-sm font-medium">1. Add the image</p>
            <p className="mt-1 text-xs leading-5 text-foreground/60">
              Drop a JPG, PNG, or WebP, or click the box to browse.
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm font-medium">2. Set quality</p>
            <p className="mt-1 text-xs leading-5 text-foreground/60">
              80% JPG is enough for most uploads. Lower it only if the form
              still rejects the file.
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm font-medium">3. Download</p>
            <p className="mt-1 text-xs leading-5 text-foreground/60">
              Check the preview, then save the smaller file. Closing the tab
              clears it.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3 text-sm leading-7 text-foreground/75">
          <h2 className="text-lg font-semibold text-foreground">
            Which format to pick
          </h2>
          <p>
            JPG is the right output for a camera photo, a product shot, or a CV
            picture. PNG stays larger because it keeps sharp edges, which is
            what you want for a logo or a screenshot with small text. WebP is
            smaller than both on most photos. If the site you are uploading to
            rejects WebP, export JPG instead.
          </p>
          <p>
            The quality slider applies to JPG and WebP. PNG ignores it and stays
            lossless, so a PNG that is still too big should be exported as JPG.
            A max width of 1600 or 1920 is enough for a web page. A 4000-pixel
            photo compressed to a small file can still be rejected if the form
            also limits pixel size. Set the width first, then compress.
          </p>
          <h2 className="pt-2 text-lg font-semibold text-foreground">
            What compression does not fix
          </h2>
          <p>
            Compression does not add detail. A blurry photo stays blurry. It
            also does not crop the frame. If a screenshot shows an account
            number, a chat, or an address, crop that out before you download.
            Shrink the file only after the private part is gone.
          </p>
          <p>
            Use this for a listing photo, a form upload, or a picture WhatsApp
            will not send. For print, keep the original. A compressed web image
            is the wrong file to hand a print shop. Do not run the same photo
            through the tool again and again. Each JPG save throws away a little
            more detail.
          </p>
          <h2 className="pt-2 text-lg font-semibold text-foreground">
            Privacy
          </h2>
          <p>
            Compression runs on this device, using the browser. Nothing is
            stored in an account, because there is no account. That is why a
            scan of an ID or a bank letter can be reduced here without uploading
            it. Close the tab when you are done, and the image leaves the page.
          </p>
        </div>
      </section>
    </div>
  );
}
