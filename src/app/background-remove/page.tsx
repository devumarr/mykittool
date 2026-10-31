"use client";

import { useEffect, useState, useRef } from "react";
import {
  FiUploadCloud,
  FiDownload,
  FiRefreshCw,
  FiZap,
  FiImage,
  FiLock,
  FiHelpCircle,
  FiEdit3,
  FiCheck,
  FiX,
  FiRotateCcw,
  FiRotateCw,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiSliders,
  FiSquare,
  FiCircle,
} from "react-icons/fi";

type Mode = "none" | "manual" | "ai";

export default function BackgroundRemovePage() {
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showColor, setShowColor] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [brushSize, setBrushSize] = useState(32);
  const [showOriginal, setShowOriginal] = useState(false);
  const [mode, setMode] = useState<Mode>("none");
  const [tool, setTool] = useState<"eraser" | "select">("eraser");
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const isProcessing = useRef(false);
  const isDrawing = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { preload } = await import("@imgly/background-removal");
        await preload({ model: "isnet_fp16", device: "cpu" });
      } catch {}
    };
    load();
  }, []);

  const startSmoothProgress = () => {
    let current = 1;
    setProgress(1);
    isProcessing.current = true;
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (!isProcessing.current) return;
      const increment =
        current < 40 ? 2.8 : current < 70 ? 1.6 : current < 90 ? 0.9 : 0.3;
      current += increment;
      if (current >= 96) current = 96;
      setProgress(Math.round(current));
    }, 140);
  };

  const finishProgress = () => {
    isProcessing.current = false;
    if (progressInterval.current) clearInterval(progressInterval.current);
    let final = progress;
    const finish = setInterval(() => {
      final += 4;
      if (final >= 100) {
        clearInterval(finish);
        setProgress(100);
      } else setProgress(Math.round(final));
    }, 25);
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    setError("");
    setResult(null);
    setIsEditing(false);
    setMode("none");
    setHistory([]);
    setHistoryIndex(-1);
    setOriginal(URL.createObjectURL(file));
  };

  const startAI = async () => {
    if (!original) return;
    setMode("ai");
    setLoading(true);
    startSmoothProgress();

    try {
      const response = await fetch(original);
      const blob = await response.blob();
      const file = new File([blob], "image.png", { type: blob.type });

      const { removeBackground } = await import("@imgly/background-removal");
      const resultBlob = await removeBackground(file, {
        model: "isnet_fp16",
        device: "cpu",
        output: { format: "image/png", quality: 1 },
      });

      finishProgress();
      const finalBlob = await applyBackground(resultBlob, bgColor, showColor);
      setResult(URL.createObjectURL(finalBlob));
    } catch (err: any) {
      isProcessing.current = false;
      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress(0);
      setError(err?.message || "Failed to remove background.");
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const startManual = () => {
    setMode("manual");
    setIsEditing(true);
    setTimeout(() => loadImageToCanvas(original!), 100);
  };

  const applyBackground = async (
    blob: Blob,
    color: string,
    apply: boolean,
  ): Promise<Blob> => {
    if (!apply) return blob;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((b) => resolve(b || blob), "image/png");
      };
      img.onerror = () => resolve(blob);
      img.src = URL.createObjectURL(blob);
    });
  };

  const loadImageToCanvas = (src: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([imageData]);
      setHistoryIndex(0);
    };
    img.src = src;
  };

  const saveHistory = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !canvasRef.current || showOriginal) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const undo = () => {
    if (historyIndex <= 0 || !canvasRef.current) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.putImageData(history[newIndex], 0, 0);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1 || !canvasRef.current) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.putImageData(history[newIndex], 0, 0);
  };

  const resetEdit = () => {
    if (history.length === 0 || !canvasRef.current) return;
    setHistoryIndex(0);
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.putImageData(history[0], 0, 0);
  };

  const saveEdit = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        setResult(URL.createObjectURL(blob));
        setIsEditing(false);
        setMode("ai");
      }
    }, "image/png");
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  const reset = () => {
    setOriginal(null);
    setResult(null);
    setError("");
    setProgress(0);
    setIsEditing(false);
    setMode("none");
    setHistory([]);
    setHistoryIndex(-1);
    isProcessing.current = false;
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-neutral-950 dark:to-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-24">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            AI Background Remover
          </h1>
          <p className="mt-3 text-neutral-500 dark:text-neutral-400 text-base max-w-xl mx-auto">
            Choose Manual or AI. Refine perfectly. Download transparent PNG.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
          {!original && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-neutral-300 dark:border-neutral-700 m-6 rounded-2xl cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-4">
                <FiUploadCloud className="text-indigo-600" size={28} />
              </div>
              <p className="text-neutral-800 dark:text-neutral-200 font-medium">
                Drop your image here
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
            </div>
          )}

          {original && mode === "none" && (
            <div className="p-6 sm:p-8">
              <img
                src={original}
                className="w-full max-h-[400px] object-contain mx-auto rounded-2xl border"
                alt="Preview"
              />
              <div className="mt-8 text-center">
                <p className="text-neutral-700 dark:text-neutral-300 font-medium mb-5">
                  How do you want to remove background?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={startManual}
                    className="flex-1 max-w-xs mx-auto sm:mx-0 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-90 transition"
                  >
                    <FiEdit3 size={18} /> Manual Edit
                  </button>
                  <button
                    onClick={startAI}
                    className="flex-1 max-w-xs mx-auto sm:mx-0 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20"
                  >
                    <FiZap size={18} /> AI Automatic
                  </button>
                </div>
              </div>
            </div>
          )}

          {original && (mode === "ai" || isEditing) && (
            <div className="p-5 sm:p-7">
              {!isEditing && (
                <>
                  <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
                    <img
                      src={original}
                      className="w-full max-h-[460px] object-contain mx-auto"
                      alt="Original"
                    />
                    {loading && (
                      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                        <p className="mt-5 text-white font-medium">
                          Removing background...
                        </p>
                        <p className="text-white/80 text-sm mt-1">
                          {progress}%
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-5">
                    <label className="flex items-center gap-2.5 text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showColor}
                        onChange={(e) => setShowColor(e.target.checked)}
                        className="rounded"
                      />
                      Add background
                    </label>
                    {showColor && (
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-9 w-14 rounded-lg cursor-pointer border"
                      />
                    )}
                    <button
                      onClick={reset}
                      className="ml-auto flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    >
                      <FiRefreshCw size={15} /> New
                    </button>
                  </div>

                  {error && (
                    <div className="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  {result && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Result
                        </p>
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setTimeout(() => loadImageToCanvas(result), 80);
                          }}
                          className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1.5 rounded-lg transition"
                        >
                          <FiEdit3 size={15} /> Manual Edit
                        </button>
                      </div>
                      <div
                        className={
                          showColor
                            ? "rounded-2xl overflow-hidden"
                            : "bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%3E%3Crect%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23f5f5f5%22/%3E%3Crect%20x%3D%228%22%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23f5f5f5%22/%3E%3Crect%20x%3D%228%22%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23ebebeb%22/%3E%3Crect%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23ebebeb%22/%3E%3C/svg%3E')] rounded-2xl overflow-hidden"
                        }
                      >
                        <img
                          src={result}
                          className="w-full max-h-[460px] object-contain mx-auto"
                          alt="Result"
                        />
                      </div>
                      <a
                        href={result}
                        download="background-removed.png"
                        className="mt-5 flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 rounded-2xl transition shadow-lg shadow-indigo-500/20"
                      >
                        <FiDownload size={17} /> Download PNG
                      </a>
                    </div>
                  )}
                </>
              )}

              {isEditing && (
                <div>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Manual Editor
                      </p>
                      <p className="text-xs text-neutral-400">
                        Paint to erase background
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowOriginal(!showOriginal)}
                        className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 transition"
                        title="Before/After"
                      >
                        {showOriginal ? (
                          <FiEyeOff size={17} />
                        ) : (
                          <FiEye size={17} />
                        )}
                      </button>
                      <button
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 disabled:opacity-40 transition"
                        title="Undo"
                      >
                        <FiRotateCcw size={17} />
                      </button>
                      <button
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 disabled:opacity-40 transition"
                        title="Redo"
                      >
                        <FiRotateCw size={17} />
                      </button>
                      <button
                        onClick={resetEdit}
                        className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 transition"
                        title="Reset"
                      >
                        <FiTrash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setTool("eraser")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${tool === "eraser" ? "bg-indigo-600 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600"}`}
                    >
                      <FiCircle size={15} /> Eraser
                    </button>
                    <button
                      onClick={() => setTool("select")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${tool === "select" ? "bg-indigo-600 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600"}`}
                    >
                      <FiSquare size={15} /> Select
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-4 bg-neutral-50 dark:bg-neutral-800/50 px-4 py-3 rounded-xl">
                    <span className="text-xs font-medium text-neutral-500">
                      Size
                    </span>
                    <input
                      type="range"
                      min="8"
                      max="150"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="flex-1 accent-indigo-600"
                    />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 w-10 text-right">
                      {brushSize}
                    </span>
                  </div>

                  <div className="relative border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-950">
                    {showOriginal && original && (
                      <img
                        src={original}
                        className="absolute inset-0 w-full h-full object-contain opacity-35 pointer-events-none"
                        alt=""
                      />
                    )}
                    <canvas
                      ref={canvasRef}
                      className="w-full max-h-[480px] object-contain cursor-crosshair touch-none relative z-10"
                      onMouseDown={() => {
                        if (!showOriginal) isDrawing.current = true;
                      }}
                      onMouseUp={() => {
                        isDrawing.current = false;
                        saveHistory();
                      }}
                      onMouseLeave={() => {
                        isDrawing.current = false;
                      }}
                      onMouseMove={draw}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        if (!showOriginal) isDrawing.current = true;
                      }}
                      onTouchEnd={() => {
                        isDrawing.current = false;
                        saveHistory();
                      }}
                      onTouchMove={draw}
                    />
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setMode("none");
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                    >
                      <FiX size={16} /> Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
                    >
                      <FiCheck size={16} /> Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Free AI Background Remover
          </h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Choose between AI automatic removal or full manual control. Refine
            edges with the brush eraser, undo/redo mistakes instantly, and
            compare before/after. Everything runs privately in your browser.
            Perfect for product photos, social media, and designs. No signup,
            unlimited free use.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: FiZap,
              title: "AI or Manual",
              desc: "Choose automatic AI or full manual control after upload.",
              color: "indigo",
            },
            {
              icon: FiEdit3,
              title: "Pro Editor",
              desc: "Eraser, undo, redo, brush size, and before/after.",
              color: "emerald",
            },
            {
              icon: FiLock,
              title: "100% Private",
              desc: "Your images never leave your device.",
              color: "violet",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-\( {item.color}-50 dark:bg- \){item.color}-950/40 flex items-center justify-center mb-4`}
              >
                <item.icon className={`text-${item.color}-600`} size={20} />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-5 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              {
                q: "Is it completely free?",
                a: "Yes. Unlimited use, no signup, no watermarks.",
              },
              {
                q: "Can I choose Manual or AI?",
                a: "Yes. After upload you can pick Manual Edit or AI Automatic.",
              },
              {
                q: "Does undo work instantly?",
                a: "Yes. Undo and redo work in real-time.",
              },
              {
                q: "Are images uploaded?",
                a: "No. Everything runs locally in your browser.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex gap-3">
                  <FiHelpCircle
                    className="text-indigo-500 mt-0.5 shrink-0"
                    size={16}
                  />
                  <div>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200 text-sm">
                      {item.q}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
