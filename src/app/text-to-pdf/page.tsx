"use client";

import React, { useRef, useState } from "react";
import {
  FileText,
  Type,
  Trash2,
  Upload,
  Loader2,
  Info,
  CheckCircle2,
  Layout,
  Maximize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";

export default function TextToPdfPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");
  const [fontSize, setFontSize] = useState(12);
  const [margin, setMargin] = useState(48);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setText(String(event.target?.result || ""));
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
      toast({ title: "File loaded" });
    };
    reader.readAsText(file);
  };

  const generatePdf = async () => {
    if (!text.trim()) {
      toast({ variant: "destructive", title: "Add some text first" });
      return;
    }

    setIsProcessing(true);
    try {
      const doc = new jsPDF({ orientation: "p", unit: "pt", format: pageSize });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxW = Math.max(80, pageWidth - margin * 2);
      const lineGap = fontSize + 6;

      doc.setProperties({
        title: title.trim() || "Text document",
        creator: "My Kit Tool",
      });

      let y = margin;

      if (title.trim()) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(fontSize + 6);
        const titleLines = doc.splitTextToSize(title.trim(), maxW);
        titleLines.forEach((line: string) => {
          if (y + lineGap > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += lineGap + 2;
        });
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(1);
        doc.line(margin, y, pageWidth - margin, y);
        y += 18;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSize);

      text.split(/\n/).forEach((para) => {
        const lines = doc.splitTextToSize(para.length ? para : " ", maxW);
        lines.forEach((line: string) => {
          if (y + lineGap > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += lineGap;
        });
        y += fontSize * 0.35;
      });

      const pages = doc.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(`${i} / ${pages}`, pageWidth / 2, pageHeight - 18, {
          align: "center",
        });
        doc.setTextColor(0);
      }

      const name = (title.trim() || "text-document")
        .replace(/[^\w\- ]+/g, "")
        .slice(0, 40);
      doc.save(`${name || "text-document"}.pdf`);
      toast({ title: "PDF ready", description: "Downloaded to your device." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Could not create PDF" });
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
          Text to PDF
        </h1>
        <p className="mt-3 max-w-xl text-sm text-foreground/60">
          Turn notes or a .txt file into a clean PDF in your browser.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-7">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-orange-400" />
          <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/40">
            <CardTitle className="flex items-center gap-3 text-sm">
              <FileText className="h-4 w-4 text-blue-600" /> Content
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> .txt
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md"
              className="hidden"
              onChange={handleFileUpload}
            />
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-foreground/50">
                <Label>Text</Label>
                <span>{text.length.toLocaleString()} chars</span>
              </div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type here..."
                className="min-h-[320px] rounded-2xl"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={generatePdf}
                disabled={isProcessing || !text.trim()}
                className="h-12 flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setText("");
                  setTitle("");
                }}
                className="h-12 w-12 rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[1.8rem] border-border shadow-xl lg:col-span-5">
          <div className="h-1 bg-gradient-to-r from-blue-600 to-orange-400" />
          <CardHeader className="border-b border-border bg-muted/40">
            <CardTitle className="text-sm">Layout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-2 gap-3">
              {(["a4", "letter"] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPageSize(id)}
                  className={cn(
                    "rounded-2xl border p-4 text-sm font-semibold",
                    pageSize === id
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-border bg-muted/30",
                  )}
                >
                  <Layout className="mx-auto mb-1 h-4 w-4" />
                  {id === "a4" ? "A4" : "Letter"}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <Label className="flex items-center gap-1">
                  <Type className="h-3.5 w-3.5" /> Size
                </Label>
                <span>{fontSize}pt</span>
              </div>
              <Slider
                value={[fontSize]}
                min={8}
                max={22}
                step={1}
                onValueChange={(v) => setFontSize(v[0])}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <Label className="flex items-center gap-1">
                  <Maximize className="h-3.5 w-3.5" /> Margin
                </Label>
                <span>{margin}pt</span>
              </div>
              <Slider
                value={[margin]}
                min={24}
                max={80}
                step={2}
                onValueChange={(v) => setMargin(v[0])}
              />
            </div>
            <div className="flex gap-3 rounded-xl bg-muted/50 p-3 text-sm text-foreground/60">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              English / numbers print clean. Urdu / emoji may miss glyphs.
            </div>
            <div className="flex gap-3 rounded-xl bg-muted/50 p-3 text-sm text-foreground/60">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              Private — runs on this device
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
            <h2 className="text-xl font-bold">Text to PDF FAQ</h2>
            <p className="text-sm text-foreground/55">
              How this converter works
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            {
              q: "Is Text to PDF free?",
              a: "Yes. Create a PDF from text on My Kit Tool at no cost.",
            },
            {
              q: "Is my text uploaded?",
              a: "No. The PDF is built in your browser. Nothing is sent to a server.",
            },
            {
              q: "Can I upload a file?",
              a: "Yes. Use the .txt button to load a text or markdown file.",
            },
            {
              q: "Does Urdu work?",
              a: "English and numbers print cleanly. Urdu and emoji may not show every character.",
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
