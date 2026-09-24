"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  UserPlus,
  ChevronRight,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth, useUser } from "@/firebase";
import { sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

function getPasswordChecks(password: string) {
  return [
    { id: "len", label: "At least 8 characters", ok: password.length >= 8 },
    { id: "up", label: "One uppercase letter", ok: /[A-Z]/.test(password) },
    {
      id: "sp",
      label: "One special character",
      ok: /[^A-Za-z0-9]/.test(password),
    },
  ];
}
export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirectTo = searchParams.get("redirect") || "/account";
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  useEffect(() => {
    if (!authLoading && user?.emailVerified) router.replace(redirectTo);
  }, [user, authLoading, router, redirectTo]);

  const mapAuthError = (code: string) => {
    switch (code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/email-already-in-use":
        return "This email is already in use.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password must be at least 8 characters.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      case "auth/network-request-failed":
        return "Network error. Check your connection.";
      default:
        return "Unable to sign in. Check your details.";
    }
  };

  const handleReset = async () => {
    setResetMsg("");
    const email = resetEmail.trim();
    if (!email) {
      setResetMsg("Enter your email.");
      return;
    }
    if (!auth) {
      setResetMsg("Login service is not ready.");
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMsg("Check your email for the reset link.");
    } catch (e: any) {
      setResetMsg(e?.message || "Could not send reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Login service is not ready.");
      return;
    }
    setIsLoading(true);
    setError(null);
    if (isSignUp) {
      if (!fullName.trim()) {
        setError("Please enter your full name.");
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 8 characters.");
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }
      if (!agreedToTerms) {
        setError("Agree to Terms and Privacy Policy.");
        setIsLoading(false);
        return;
      }
    }
    try {
      if (isSignUp) {
        const missing = getPasswordChecks(password)
          .filter((c) => !c.ok)
          .map((c) => c.label);

        if (missing.length) {
          setError("Complete first: " + missing.join(", "));
          setIsLoading(false);
          return;
        }

        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(cred.user, { displayName: fullName });
        await sendEmailVerification(cred.user, {
          url: "https://mykittool.online/login",
          handleCodeInApp: false,
        });
        sessionStorage.setItem("pendingEmail", email);
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        await signOut(auth);
        setError("Verify your email first. Check your inbox.");
        return;
      }
      sessionStorage.removeItem("oldEmail");
      sessionStorage.removeItem("pendingNewEmail");
      sessionStorage.removeItem("emailJustChanged");
      toast({ title: "Logged in" });
      router.push(redirectTo);
    } catch (err: any) {
      setError(mapAuthError(err?.code || "unknown"));
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogle = async () => {
    if (!auth) {
      setError("Login service is not ready.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      sessionStorage.removeItem("oldEmail");
      sessionStorage.removeItem("pendingNewEmail");
      sessionStorage.removeItem("emailJustChanged");
      toast({ title: "Logged in" });
      router.push(redirectTo);
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        setError(null);
      } else if (err?.code === "auth/unauthorized-domain") {
        setError("This domain is not allowed");
      } else {
        setError(mapAuthError(err?.code || "unknown"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithub = async () => {
    if (!auth) {
      setError("Login service is not ready.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, new GithubAuthProvider());
      sessionStorage.removeItem("oldEmail");
      sessionStorage.removeItem("pendingNewEmail");
      sessionStorage.removeItem("emailJustChanged");
      toast({ title: "Logged in" });
      router.push(redirectTo);
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        setError(null);
      } else if (
        err?.code === "auth/account-exists-with-different-credential"
      ) {
        setError("This email already uses another login method.");
      } else if (err?.code === "auth/unauthorized-domain") {
        setError("This domain is not allowed");
      } else {
        setError(mapAuthError(err?.code || "unknown"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-[440px]">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-foreground/50 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <Card className="overflow-hidden rounded-[1.8rem] border-black/5 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.10)] dark:border-white/10 dark:bg-white/[0.04]">
          <div className="h-[3px] bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-orange-400" />
          <CardHeader className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white shadow-lg shadow-blue-500/30">
              {isSignUp ? (
                <UserPlus className="h-6 w-6" />
              ) : (
                <User className="h-6 w-6" />
              )}
            </div>

            <CardTitle className="text-3xl font-black tracking-tight">
              {isSignUp ? "Register" : "Login"}
            </CardTitle>
            <p className="mt-2 text-sm text-foreground/55">
              {isSignUp
                ? "Create your free account"
                : "Sign in to your dashboard"}
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label className="text-xs text-foreground/55">
                    Full name
                  </Label>
                  <div className="relative">
                    <Input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter Your Full Name"
                      className="h-12 rounded-2xl bg-secondary/50 pl-10"
                    />
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs text-foreground/55">Email</Label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="h-12 rounded-2xl bg-secondary/50 pl-10"
                  />
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-foreground/55">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 rounded-2xl bg-secondary/50 pl-10 pr-10"
                  />
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {!isSignUp && (
                <Link href="/forgot-password" className="text-sm text-blue-500">
                  Forgot password?
                </Link>
              )}
              {isSignUp &&
                (() => {
                  const checks = getPasswordChecks(password);
                  const lenScore = Math.min(password.length, 12) * 5;
                  const upScore = /[A-Z]/.test(password) ? 20 : 0;
                  const spScore = /[^A-Za-z0-9]/.test(password) ? 20 : 0;
                  const pct = Math.min(lenScore + upScore + spScore, 100);
                  const word =
                    pct < 40 ? "Weak" : pct < 75 ? "Normal" : "Strong";
                  const bar =
                    pct < 40
                      ? "bg-red-500"
                      : pct < 75
                        ? "bg-yellow-500"
                        : "bg-green-500";

                  return (
                    <div className="mt-3 space-y-3">
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p
                        className={`text-xs font-medium ${
                          pct < 40
                            ? "text-red-500"
                            : pct < 75
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {word}
                      </p>

                      <ul className="space-y-1.5">
                        {checks.map((c) => (
                          <li
                            key={c.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span
                              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                                c.ok
                                  ? "bg-green-500 text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {c.ok ? "✓" : ""}
                            </span>
                            <span
                              className={
                                c.ok
                                  ? "text-green-600 line-through"
                                  : "text-muted-foreground"
                              }
                            >
                              {c.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

              {isSignUp && (
                <div className="space-y-2">
                  <Label className="text-xs text-foreground/55">
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={cn(
                        "h-12 rounded-2xl bg-secondary/50 pl-10 pr-10",
                        password &&
                          confirmPassword &&
                          password !== confirmPassword &&
                          "border-red-500",
                      )}
                    />
                    <Shield className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {isSignUp && (
                <div className="flex items-start gap-3 pt-1">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(c) => setAgreedToTerms(c === true)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-xs leading-relaxed text-foreground/60"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary">
                      Terms
                    </Link>{" "}
                    &{" "}
                    <Link href="/privacy" className="text-primary">
                      Privacy
                    </Link>
                  </Label>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-xs text-red-500">{error}</p>
                </div>
              )}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={isLoading}
                className="group flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-black/10 bg-white text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"
                  />
                  <path
                    fill="#34A853"
                    d="M6.6 14.3l-.9.7-2.5 1.9C5.1 20.1 8.3 22 12 22c2.7 0 5-.9 6.7-2.4l-3.1-2.4c-.9.6-2 1-3.6 1-2.7 0-5-1.8-5.8-4.3z"
                  />
                  <path
                    fill="#4A90E2"
                    d="M3.2 7.1C2.4 8.6 2 10.3 2 12s.4 3.4 1.2 4.9l3.4-2.6C6.2 13.4 6 12.7 6 12s.2-1.4.6-2.3L3.2 7.1z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3 14.6 2 12 2 8.3 2 5.1 3.9 3.2 7.1l3.4 2.6C7 7.8 9.3 6 12 6z"
                  />
                </svg>
                <span className="transition-colors group-hover:text-primary">
                  Continue with Google
                </span>
              </button>
              <button
                type="button"
                onClick={handleGithub}
                disabled={isLoading}
                className="group mt-3 flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-black/10 bg-white text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 .1.8 1.8 2.8 1.3.1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6a4.7 4.7 0 0 1 1.3-3.3 4.3 4.3 0 0 1 .1-3.2s1-.3 3.4 1.3a11.6 11.6 0 0 1 6.2 0C17.7 4.7 18.7 5 18.7 5a4.3 4.3 0 0 1 .1 3.2 4.7 4.7 0 0 1 1.2 3.3c0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
                </svg>
                Continue with GitHub
              </button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-2xl bg-[#2563eb] text-white shadow-lg shadow-blue-500/25"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="inline-flex items-center gap-2">
                    {isSignUp ? "Create account" : "Login"}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="w-full pt-2 text-center text-sm text-foreground/55"
              >
                {isSignUp ? (
                  <>
                    Already have an account?{" "}
                    <span className="font-semibold text-primary">Login</span>
                  </>
                ) : (
                  <>
                    No account?{" "}
                    <span className="font-semibold text-primary">Register</span>
                  </>
                )}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
