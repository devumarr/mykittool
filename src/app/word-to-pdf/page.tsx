"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Loader2,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";

type Block = { type: "h" | "p"; text: string };

export default function WordToPdfPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${["B", "KB", "MB", "GB"][i]}`;
  };

  const getBlocks = async (buffer: ArrayBuffer): Promise<Block[]> => {
    try {
      const html = (await mammoth.convertToHtml({ arrayBuffer: buffer })).value;
      const doc = new DOMParser().parseFromString(
        `<div>${html}</div>`,
        "text/html",
      );
      const blocks: Block[] = [];
      doc.body.querySelectorAll("h1,h2,h3,h4,p,li").forEach((el) => {
        const text = (el.textContent || "").replace(/\s+/g, " ").trim();
        if (!text) return;
        blocks.push({
          type: /^H/i.test(el.tagName) ? "h" : "p",
          text,
        });
      });
      if (blocks.length) return blocks;
    } catch {
      /* fall through */
    }
    const raw = (await mammoth.extractRawText({ arrayBuffer: buffer })).value;
    return raw
      .split(/\n+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text) => ({ type: "p" as const, text }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const ext = selected.name.split(".").pop()?.toLowerCase();
    if (ext !== "docx") {
      toast({
        variant: "destructive",
        title: "Use a .docx file",
        description: "Old .doc files are not supported in the browser.",
      });
      return;
    }
    setFile(selected);
    setPdfUrl(null);
    try {
      const blocks = await getBlocks(await selected.arrayBuffer());
      setPreview(
        blocks
          .map((b) => b.text)
          .join("\n")
          .slice(0, 1200),
      );
    } catch {
      setPreview("");
    }
  };

  const convertToPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const blocks = await getBlocks(await file.arrayBuffer());
      if (!blocks.length) throw new Error("No text found");

      const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 48;
      const maxW = pageW - margin * 2;
      let y = margin;

      doc.setProperties({
        title: file.name.replace(/\.[^.]+$/, ""),
        creator: "My Kit Tool",
      });

      const writeLines = (
        lines: string[],
        size: number,
        bold: boolean,
        gap: number,
      ) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(size);
        lines.forEach((line) => {
          if (y + gap > pageH - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += gap;
        });
      };

      blocks.forEach((block) => {
        if (block.type === "h") {
          y += 8;
          writeLines(doc.splitTextToSize(block.text, maxW), 16, true, 22);
          y += 6;
        } else {
          writeLines(doc.splitTextToSize(block.text, maxW), 12, false, 18);
          y += 8;
        }
      });

      const pages = doc.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(`${i} / ${pages}`, pageW / 2, pageH - 20, { align: "center" });
        doc.setTextColor(0);
      }

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(url);
      toast({ title: "PDF ready" });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Convert failed",
        description: "Use a normal .docx, not a scanned or locked file.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview("");
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
          PDF tools
        </p>
        <h1 className="text-3xl font-black tracking-tight md:text-5xl">
          Word to PDF
        </h1>
        <p className="mt-3 max-w-xl text-sm text-foreground/60">
          Convert a .docx file to PDF in your browser. Text and headings stay
          readable.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-5">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle className="flex items-center gap-3 text-sm">
              <FileText className="h-4 w-4 text-blue-600" /> Word file
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
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
                  <p className="max-w-[220px] truncate text-sm font-bold">
                    {file.name}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {formatSize(file.size)}
                  </p>
                </>
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-foreground/30" />
                  <p className="text-sm font-semibold">Drop or click .docx</p>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="flex gap-3">
              <Button
                onClick={convertToPdf}
                disabled={!file || isProcessing}
                className="h-12 flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Convert
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                className="h-12 w-12 rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-3 rounded-xl bg-muted/50 p-3 text-sm text-foreground/60">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              Images and complex layout are simplified. Use .docx only.
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-7">
          <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-400" />
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle className="text-sm">Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {pdfUrl ? (
              <>
                <div className="rounded-2xl bg-muted/40 p-8 text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-blue-600" />
                  <p className="font-bold">PDF ready</p>
                </div>
                <Button
                  asChild
                  className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  <a
                    href={pdfUrl}
                    download={`\( {file?.name.replace(/\.[^.]+ \)/, "") || "document"}.pdf`}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                  </a>
                </Button>
              </>
            ) : (
              <p className="text-sm text-foreground/50">
                Convert a file to see the download.
              </p>
            )}
            {preview && (
              <pre className="max-h-48 overflow-auto rounded-2xl bg-muted/40 p-4 text-xs leading-relaxed text-foreground/70">
                {preview}
              </pre>
            )}
            <div className="flex gap-3 text-sm text-foreground/60">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              Runs on this device. File is not uploaded.
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="mx-auto mt-16 max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold">Word to PDF FAQ</h2>
            <p className="text-sm text-foreground/55">
              How this converter works
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            {
              q: "Which Word files work?",
              a: "Use .docx. Old .doc files are not supported in the browser.",
            },
            {
              q: "Is my document uploaded?",
              a: "No. Conversion runs in your browser. The file stays on your device.",
            },
            {
              q: "Is it free?",
              a: "Yes. Word to PDF on My Kit Tool is free.",
            },
            {
              q: "Will images look the same?",
              a: "Text and headings convert best. Images and complex layout are simplified.",
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
