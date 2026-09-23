"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { applyActionCode } from "firebase/auth";
import { useAuth } from "@/firebase";
import { ShieldCheck, CircleAlert, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthActionPage() {
  const auth = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "bad">("loading");
  const [msg, setMsg] = useState("Checking your link");

  useEffect(() => {
    if (!auth) return;
    const mode = params.get("mode");
    const code = params.get("oobCode");

    if (!mode || !code) {
      setStatus("bad");
      setMsg("This link is missing or expired.");
      return;
    }

    if (mode === "verifyEmail") {
      applyActionCode(auth, code)
        .then(() => {
          setStatus("ok");
          setMsg("Your email is verified. You can sign in now.");
        })
        .catch(() => {
          setStatus("bad");
          setMsg("This link is invalid or already used.");
        });
      return;
    }

    setStatus("bad");
    setMsg("This link type is not supported.");
  }, [auth, params]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_55%)]" />
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card/80 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div
          className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${
            status === "ok"
              ? "bg-emerald-500/15 text-emerald-500"
              : status === "bad"
                ? "bg-amber-500/15 text-amber-500"
                : "bg-primary/15 text-primary"
          }`}
        >
          {status === "loading" && <Loader2 className="h-7 w-7 animate-spin" />}
          {status === "ok" && <ShieldCheck className="h-7 w-7" />}
          {status === "bad" && <CircleAlert className="h-7 w-7" />}
        </div>
        <p className="mb-2 text-[11px] font-medium tracking-[0.22em] text-primary uppercase">
          My Kit Tool
        </p>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight">
          {status === "ok"
            ? "Email verified"
            : status === "bad"
              ? "Link issue"
              : "Verifying"}
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          {msg}
        </p>
        <div className="mb-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          Encrypted confirmation
        </div>
        <Button
          className="w-full h-11 rounded-xl"
          onClick={() => router.push("/login")}
        >
          Continue to login
        </Button>
      </div>
    </div>
  );
}
