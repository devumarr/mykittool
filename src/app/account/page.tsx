"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  LogOut,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  BadgeCheck,
  Shield,
  Clock,
  Loader2,
  Settings2,
  Smartphone,
  Save,
  Globe,
  Activity,
  Send,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useAuth } from "@/firebase";
import {
  signOut,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
  deleteUser,
} from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AccountPage() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const { user, loading } = useUser();
  const [displayName, setDisplayName] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      if (sessionStorage.getItem("emailJustChanged")) {
        router.replace("/login");
        return;
      }
      router.replace("/login?redirect=/account");
    }
    if (user) setDisplayName(user.displayName || "");
  }, [user, loading, router]);

  const deleteAccount = async () => {
    if (!user) return;
    if (deleteText !== "DELETE") {
      setDeleteMsg("Type DELETE to confirm.");
      return;
    }
    if (!deletePassword.trim()) {
      setDeleteMsg("Enter current password first.");
      return;
    }

    setDeleteBusy(true);
    setDeleteMsg("");

    try {
      const cred = EmailAuthProvider.credential(
        user.email || "",
        deletePassword,
      );
      await reauthenticateWithCredential(user, cred);

      try {
        if (db) {
          await deleteDoc(doc(db, "users", user.uid));
        }
      } catch {}

      await deleteUser(user);
      window.location.href = "/";
    } catch (e: any) {
      const c = e?.code || "";
      if (c === "auth/wrong-password" || c === "auth/invalid-credential") {
        setDeleteMsg("Wrong password.");
      } else if (c === "auth/missing-password") {
        setDeleteMsg("Wrong password.");
      } else if (c === "auth/requires-recent-login") {
        setDeleteMsg("Login again, then delete.");
      } else if (c === "auth/too-many-requests") {
        setDeleteMsg("Too many tries. Wait and try again.");
      } else {
        setDeleteMsg("Could not delete account.");
      }
    } finally {
      setDeleteBusy(false);
    }
  };

  const changeEmail = async () => {
    <Input
      type="password"
      value={currentPassword}
      onChange={(e) => {
        setCurrentPassword(e.target.value);
        if (emailMsg) setEmailMsg("");
      }}
      placeholder="••••••••"
      className={`mt-1 ${
        emailMsg === "Current password is wrong."
          ? "border-red-500 ring-2 ring-red-500/30 animate-pulse"
          : ""
      }`}
    />;
    if (!user?.email) return;
    if (!newEmail.trim() || !currentPassword) {
      setEmailMsg("Enter new email and current password.");
      return;
    }
    setEmailBusy(true);
    setEmailMsg("");
    try {
      const cred = EmailAuthProvider.credential(
        user.email || "",
        deletePassword,
      );
      await reauthenticateWithCredential(user, cred);
      sessionStorage.setItem("oldEmail", user.email || "");
      sessionStorage.setItem("pendingNewEmail", newEmail.trim());
      await verifyBeforeUpdateEmail(user, newEmail.trim(), {
        url: "https://mykittool.online/account",
        handleCodeInApp: false,
      });
      setEmailMsg("Check the new inbox and tap the link to finish.");
      setNewEmail("");
      setCurrentPassword("");
    } catch (err: any) {
      const code = err?.code || "";
      if (
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setEmailMsg("Current password is wrong.");
      } else if (code === "auth/email-already-in-use") {
        setEmailMsg("This email is already in use.");
      } else if (code === "auth/requires-recent-login") {
        setEmailMsg("Login again, then change email.");
      } else if (code === "auth/operation-not-allowed") {
        setEmailMsg("Email change is not enabled for this login method.");
      } else {
        setEmailMsg("Could not start email change.");
      }
    } finally {
      setEmailBusy(false);
    }
  };
  useEffect(() => {
    if (!user) return;
    if (!sessionStorage.getItem("pendingNewEmail")) return;

    const tick = async () => {
      const finish = async () => {
        sessionStorage.removeItem("oldEmail");
        sessionStorage.removeItem("pendingNewEmail");
        sessionStorage.setItem("emailJustChanged", "1");
        try {
          if (auth) await signOut(auth);
        } catch {}
        router.replace("/login");
      };

      try {
        await user.reload();
      } catch (err: any) {
        if (err?.code === "auth/user-token-expired") await finish();
        return;
      }

      const now = user.email || "";
      const oldEmail = sessionStorage.getItem("oldEmail") || "";
      const pending = sessionStorage.getItem("pendingNewEmail") || "";
      if (!now || !oldEmail) return;
      if (now === oldEmail) return;
      if (pending && now !== pending) return;
      await finish();
    };

    tick();
    const id = setInterval(tick, 2500);
    return () => clearInterval(id);
  }, [user, auth, router]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateProfile(user, { displayName });
      toast({ title: "Name updated", description: "Your profile is saved." });
    } catch {
      toast({ variant: "destructive", title: "Update failed" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !currentPassword || !newPass) return;
    if (newPass !== confirmPass) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }
    setIsUpdating(true);
    try {
      if (!user.email) {
        toast({ variant: "destructive", title: "No email on this account" });
        setCurrentPassword("");
        return;
      }
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPass);
      setNewPass("");
      setConfirmPass("");
      toast({ title: "Password changed" });
    } catch (err: any) {
      const code = err?.code || "";
      let title = "Failed";
      let description = err?.message || "Could not update password.";
      if (
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        title = "Wrong current password";
        description = "Current password is not correct.";
      } else if (code === "auth/weak-password") {
        title = "Weak password";
        description = "Use a stronger new password.";
      } else if (code === "auth/network-request-failed") {
        title = "Network error";
        description =
          "My Kit Tool request blocked. Turn off adblock and try again.";
      } else if (code === "auth/requires-recent-login") {
        title = "Login again";
        description = "Log out and log in, then change password.";
      }
      toast({ variant: "destructive", title, description });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/");
      toast({ title: "Logged out" });
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-semibold tracking-widest text-primary">
          Loading profile
        </p>
      </div>
    );
  }

  const creationDate = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-foreground/50 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="relative mb-10 overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.10)] dark:border-white/10 dark:bg-white/[0.04]">
          <div className="h-[3px] bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-orange-400" />
          <div className="pointer-events-none absolute right-[-40px] top-[-40px] h-48 w-48 rounded-full bg-[#2563eb]/10 blur-3xl" />
          <div className="flex flex-col items-center gap-8 p-8 md:flex-row md:items-center md:p-10">
            <div className="relative">
              <div className="absolute -inset-2 rounded-[1.8rem] bg-gradient-to-br from-[#2563eb] to-orange-400 opacity-30 blur-md" />
              <Avatar className="relative h-28 w-28 rounded-[1.6rem] border-4 border-white shadow-xl dark:border-background md:h-32 md:w-32">
                <AvatarImage
                  src={
                    user.photoURL ||
                    `https://i.ibb.co/RTZYSzvR/f2a3fc286c53.png/${user.uid}/300/300`
                  }
                  className="object-cover"
                />
                <AvatarFallback className="bg-secondary text-3xl font-black text-primary">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-xl border-4 border-white bg-[#2563eb] text-white dark:border-background">
                <BadgeCheck className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="min-w-0 flex-1 text-center md:text-left">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]">
                Account
              </p>
              <h1 className="truncate text-4xl font-black tracking-tight text-foreground md:text-5xl">
                {user.displayName || "Member"}
              </h1>
              <p className="mt-2 text-sm text-foreground/65">{user.email}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                <Badge className="rounded-full border-0 bg-[#2563eb] px-3 py-1 text-white">
                  Studio member
                </Badge>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground/65">
                  <Clock className="h-3.5 w-3.5 text-[#2563eb]" />{" "}
                  {creationDate}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground/65">
                  <Smartphone className="h-3.5 w-3.5 text-[#2563eb]" />{" "}
                  {user.uid.substring(0, 5).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Card className="group overflow-hidden rounded-[1.8rem] border-black/5 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(37,99,235,0.14)] dark:border-white/10 dark:bg-white/[0.04]">
              <div className="h-[3px] bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-orange-400" />
              <CardHeader className="border-b border-black/5 bg-[#2563eb]/5">
                <CardTitle className="flex items-center gap-3 text-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white shadow-md">
                    <Settings2 className="h-4 w-4" />
                  </span>
                  Profile settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-6 sm:p-8">
                <div className="space-y-3">
                  <Label className="text-xs text-foreground/55">
                    Full name
                  </Label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="h-12 flex-1 rounded-2xl border-black/5 bg-secondary/60"
                    />
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                      className="h-12 rounded-2xl bg-[#2563eb] px-6 shadow-lg shadow-blue-500/25 transition-transform hover:scale-105"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="relative mt-8 overflow-hidden rounded-2xl border border-primary/20 bg-card p-5 shadow-[0_0_0_1px_rgba(59,130,246,0.08)]">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold tracking-wide">
                        Change email
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Now:{" "}
                        <span className="font-medium text-foreground">
                          {user.email}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <Label className="text-xs">New email</Label>
                      <Input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="name@email.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Current password</Label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {newEmail.trim() ? (
                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-primary/10 px-3 py-2 text-xs text-foreground">
                      <Send className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <p>
                        Confirm link will go to{" "}
                        <span className="font-semibold">{newEmail.trim()}</span>
                        . Open that inbox, not the old one.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                      <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <p>Type the new email. The link is sent there.</p>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={changeEmail}
                    disabled={emailBusy}
                    className="mt-4 w-full"
                  >
                    {emailBusy ? "Sending..." : "Send change link"}
                  </Button>

                  {emailMsg === "Current password is wrong." && (
                    <p className="mt-2 animate-bounce text-sm font-medium text-red-500">
                      Wrong password. Try again.
                    </p>
                  )}

                  {emailMsg ===
                    "Check the new inbox and tap the link to finish." && (
                    <div className="mt-3 animate-pulse rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-600">
                      Link sent. Open the new email inbox and tap the link.
                    </div>
                  )}

                  {emailMsg &&
                    emailMsg !== "Current password is wrong." &&
                    emailMsg !==
                      "Check the new inbox and tap the link to finish." && (
                      <p className="mt-2 text-sm text-red-500">{emailMsg}</p>
                    )}
                </div>
                <div className="space-y-5 rounded-2xl border border-black/5 bg-secondary/30 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white shadow-md">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Change password</p>
                      <p className="text-xs text-foreground/55">
                        Update your account password
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      className="h-12 w-full rounded-2xl bg-background px-3"
                    />
                    <Input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="New password"
                      className="h-12 rounded-2xl bg-background"
                    />
                    <Input
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Confirm password"
                      className="h-12 rounded-2xl bg-background"
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={isUpdating || !currentPassword || !newPass}
                    variant="outline"
                    className="h-12 w-full rounded-2xl border-[#2563eb]/20 hover:bg-[#2563eb] hover:text-white"
                  >
                    {isUpdating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="mr-2 h-4 w-4" />
                    )}
                    Update password
                  </Button>
                </div>

                <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
                  <h2 className="text-sm font-semibold text-red-500">
                    Delete account
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This removes your login and saved account data. Tools stay.
                    Type DELETE to confirm.
                  </p>
                  <label className="mt-3 block text-sm">Current password</label>
                  <Input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Current password"
                    className="mt-1"
                  />
                  <Input
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder="DELETE"
                    className="mt-3"
                  />

                  <Button
                    type="button"
                    onClick={deleteAccount}
                    disabled={deleteBusy}
                    className="mt-3 bg-red-600 text-white hover:bg-red-700"
                  >
                    {deleteBusy ? "Deleting..." : "Delete account"}
                  </Button>

                  {deleteMsg ? (
                    <p className="mt-2 text-sm text-red-500">{deleteMsg}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-start gap-4 rounded-[1.6rem] border border-emerald-500/15 bg-gradient-to-r from-emerald-500/10 to-transparent p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Security guaranteed</h4>
                <p className="mt-1 text-sm text-foreground/60">
                  Account details are encrypted.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <Card className="overflow-hidden rounded-[1.8rem] border-black/5 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(37,99,235,0.12)] dark:border-white/10 dark:bg-white/[0.04]">
              <div className="h-[3px] bg-gradient-to-r from-[#2563eb] to-[#60a5fa]" />
              <CardHeader className="border-b border-black/5 bg-[#2563eb]/5">
                <CardTitle className="flex items-center gap-3 text-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white shadow-md">
                    <Activity className="h-4 w-4" />
                  </span>
                  Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {[
                  { label: "Email", val: user.email, icon: Mail },
                  {
                    label: "Login",
                    val:
                      user.providerData[0]?.providerId === "password"
                        ? "Email / password"
                        : "SSO",
                    icon: Globe,
                  },
                  {
                    label: "Status",
                    val: user.emailVerified ? "Verified" : "Pending",
                    icon: Shield,
                    color: user.emailVerified
                      ? "text-emerald-500"
                      : "text-amber-500",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-foreground/50">
                        {item.label}
                      </p>
                      <p
                        className={cn(
                          "truncate text-sm font-semibold",
                          item.color,
                        )}
                      >
                        {item.val}
                      </p>
                    </div>
                  </div>
                ))}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="h-12 w-full rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
