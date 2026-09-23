"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import { useUser } from "@/firebase";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading } = useUser();
  const [seconds, setSeconds] = useState(60);
  const [msg, setMsg] = useState(
    "We sent a verification link. Keep this tab open.",
  );
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const saved =
      user?.email ||
      params.get("email") ||
      sessionStorage.getItem("pendingEmail") ||
      "";
    setEmail(saved);
    if (saved) sessionStorage.setItem("pendingEmail", saved);
  }, [user, params]);

  useEffect(() => {
    if (!seconds || done) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, done]);

  useEffect(() => {
    if (!user) return;
    const tick = async () => {
      await user.reload();
      if (user.emailVerified) {
        sessionStorage.removeItem("pendingEmail");
        setDone(true);
      }
    };
    tick();
    const id = setInterval(tick, 2500);
    return () => clearInterval(id);
  }, [user]);

  const resend = async () => {
    if (!user || seconds > 0 || done) return;
    await sendEmailVerification(user, {
      url: "https://mykittool.online/login",
      handleCodeInApp: false,
    });
    setSeconds(60);
    setMsg("New link sent. Check inbox and spam.");
  };

  if (loading) return <main className="min-h-[85vh] bg-background" />;

  return (
    <main className="relative min-h-[85vh] bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.14),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-[85vh] max-w-lg items-center px-4 py-16">
        <section className="w-full rounded-[28px] bg-card/90 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.10)] ring-1 ring-black/5 dark:ring-white/10">
          {done ? (
            <>
              <p className="text-xs text-primary">My Kit Tool</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                Email verified
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your account is ready. Continue to open your tools.
              </p>
              <div className="mt-6 rounded-2xl bg-muted/50 px-4 py-4">
                <p className="text-[11px] text-muted-foreground">Account</p>
                <p className="mt-1 break-all text-sm font-medium">
                  {email || user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.replace("/")}
                className="mt-6 w-full rounded-2xl bg-primary py-3 text-sm font-medium text-primary-foreground"
              >
                Go to your account
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-primary">My Kit Tool</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                Check your inbox
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {msg}
              </p>

              <div className="mt-6 rounded-2xl bg-muted/50 px-4 py-4">
                <p className="text-[11px] text-muted-foreground">Sent to</p>
                <p className="mt-1 break-all text-sm font-medium">
                  {email || "Waiting for email"}
                </p>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                Open the email, tap the link, then come back to this tab.
              </p>

              <div className="mt-7">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Resend</span>
                  <span>{seconds > 0 ? `${seconds}s` : "Ready"}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${((60 - seconds) / 60) * 100}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={resend}
                disabled={!user || seconds > 0}
                className="mt-5 w-full rounded-2xl bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-40"
              >
                {seconds > 0 ? `Resend in ${seconds}s` : "Resend email"}
              </button>

              <Link
                href="/login"
                className="mt-5 block text-center text-sm text-primary"
              >
                Already verified? Log in
              </Link>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
