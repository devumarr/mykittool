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
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useAuth } from "@/firebase";
import { signOut, updateProfile, updatePassword } from "firebase/auth";
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

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/account");
    if (user) setDisplayName(user.displayName || "");
  }, [user, loading, router]);

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
    if (!user || !newPass) return;
    if (newPass !== confirmPass) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }
    setIsUpdating(true);
    try {
      await updatePassword(user, newPass);
      setNewPass("");
      setConfirmPass("");
      toast({ title: "Password changed" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title:
          err.code === "auth/requires-recent-login" ? "Login again" : "Failed",
        description:
          err.code === "auth/requires-recent-login"
            ? "Log out and back in to change password."
            : err.message,
      });
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
                    disabled={isUpdating || !newPass}
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
              </CardContent>
            </Card>

            <div className="flex items-start gap-4 rounded-[1.6rem] border border-emerald-500/15 bg-gradient-to-r from-emerald-500/10 to-transparent p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Security guaranteed</h4>
                <p className="mt-1 text-sm text-foreground/60">
                  Account details are encrypted and managed with Firebase.
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
