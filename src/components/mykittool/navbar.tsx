"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import {
  Scan,
  Home,
  Menu,
  QrCode,
  Layers,
  Type,
  Coffee,
  User,
  X,
  LogIn,
  LogOut,
  UserPlus,
  ChevronDown,
  ShieldCheck,
  Settings,
  Info,
  Heart,
  Fingerprint,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { ThemeToggle } from "./theme-toggle";

const QrScannerModal = dynamic(
  () => import("./qr-scanner-modal").then((mod) => mod.QrScannerModal),
  {
    ssr: false,
  },
);

/**
 * Static Logo Component
 */
const Logo = ({
  className = "h-8",
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) => (
  <div className={cn("flex items-center gap-1.5 sm:gap-3", className)}>
    <div className="relative w-7 h-7 sm:w-8 h-8 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 bg-[#2563eb] rounded-lg shadow-lg shadow-blue-600/10 flex items-center justify-center overflow-hidden icon-container-3d">
        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 grid grid-cols-2 gap-0.5 relative z-10">
          <div className="border-[1.5px] border-white rounded-[1px]" />
          <div className="bg-white/40 rounded-[1px]" />
          <div className="bg-white/40 rounded-[1px]" />
          <div className="bg-white rounded-[1px]" />
        </div>
      </div>
    </div>
    {!iconOnly && (
      <div className="font-headline font-black text-base sm:text-2xl tracking-tighter leading-none flex items-center min-w-0">
        <span className="text-[#0f172a] dark:text-white uppercase truncate">
          MY KIT
        </span>
        <span className="text-[#2563eb] ml-0.5 sm:ml-1 shrink-0 uppercase">
          TOOL
        </span>
      </div>
    )}
  </div>
);

/**
 * STATIC NAV ITEMS REGISTRY
 */
const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "About", href: "/about", icon: Info },
  { label: "Support", href: "/donate", icon: Coffee },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-foreground/5 bg-background/80 backdrop-blur-xl h-16">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 h-full flex items-center justify-between gap-1 sm:gap-4 max-w-full box-border">
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 group transition-transform active:scale-95 min-w-0"
            aria-label="My Kit Tool Home"
          >
            <Logo />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Secondary Utilities */}

            <ThemeToggle />

            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground sm:h-10 sm:w-10"
              aria-label="Open QR Scanner"
            >
              <Scan className="h-4 w-4" />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/50 text-foreground hover:text-primary sm:h-10 sm:w-10"
              >
                {menuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-[110] mt-2 w-56 rounded-2xl bg-card p-2 shadow-2xl">
                  {[
                    { label: "Home", href: "/", icon: Home },

                    { label: "All Tools", href: "/all-tools", icon: Layers },
                    { label: "About", href: "/about", icon: Info },
                    { label: "Support", href: "/donate", icon: Coffee },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-muted",
                        pathname === item.href
                          ? "text-primary"
                          : "text-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}

                  <div className="my-1.5 h-px bg-border" />

                  {user ? (
                    <>
                      <Link
                        href="/account"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-muted"
                      >
                        <User className="h-4 w-4" />
                        Account
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-muted"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-muted"
                    >
                      <User className="h-4 w-4" />
                      Account
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* SCANNER */}
          </div>
        </div>
      </header>

      {isScannerOpen && (
        <QrScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </>
  );
}
