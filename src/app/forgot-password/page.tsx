"use client";

import { useState } from "react";
import Link from "next/link";
import {
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useAuth } from "@/firebase";
import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setMsg("");
    setOk(false);
    const value = email.trim();
    if (!value) {
      setMsg("Enter your email.");
      return;
    }
    if (!auth) {
      setMsg("Login service is not ready.");
      return;
    }
    setLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, value);
      if (!methods.length) {
        setMsg("This email is not registered on My Kit Tool.");
        return;
      }
      await sendPasswordResetEmail(auth, value);
      setOk(true);
      setMsg(
        "This email is registered. Reset link sent. Check inbox and spam.",
      );
    } catch (e: any) {
      const code = e?.code || "";
      if (code === "auth/user-not-found") {
        setMsg("This email is not registered on My Kit Tool.");
      } else if (code === "auth/invalid-email") {
        setMsg("Enter a valid email.");
      } else {
        setMsg(e?.message || "Could not send reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-8rem] h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto grid min-h-screen max-w-5xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden lg:block">
          <p className="text-xs uppercase tracking-[0.22em] text-primary">
            My Kit Tool
          </p>
          <h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-tight">
            Recover access in one quiet step.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
            We verify the email against your Firebase account first. No reset
            mail is sent for unknown addresses.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Account check before send",
              "Private reset link by email",
              "Works in light and dark mode",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <ShieldCheck className="h-4 w-4 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <section className="rounded-[32px] border border-border/80 bg-card/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              Secure
            </span>
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            Reset password
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Enter the email you used to create your account.
          </p>

          <div className="mt-7">
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Email address
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3.5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
              <Mail className="h-4 w-4 text-primary" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="you@email.com"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_hsl(var(--primary)/0.28)] transition hover:translate-y-[-1px] disabled:opacity-60"
          >
            {loading ? "Checking account..." : "Send reset link"}
          </button>

          {msg && (
            <div
              className={`mt-4 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${
                ok
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
              }`}
            >
              {ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{msg}</span>
            </div>
          )}

          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </section>
      </main>
    </div>
  );
}
