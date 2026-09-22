"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Coffee, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={cn("flex items-center gap-3", className)}>
    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl bg-primary shadow-lg shadow-primary/25">
        <div className="relative z-10 grid h-4 w-4 grid-cols-2 gap-0.5">
          <div className="rounded-[1.5px] border-[1.5px] border-white" />
          <div className="rounded-[1.5px] bg-white/40" />
          <div className="rounded-[1.5px] bg-white/40" />
          <div className="rounded-[1.5px] bg-white" />
        </div>
      </div>
    </div>
    <p className="text-base font-semibold tracking-tight">
      <span className="text-foreground">My Kit</span>
      <span className="ml-1 text-primary">Tool</span>
    </p>
  </div>
);

const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className="group relative w-fit text-[15px] text-foreground/80 transition-colors hover:text-primary"
  >
    {children}
    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
  </Link>
);

export function Footer() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />

      <div className="relative mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Free browser tools for PDF, images and AI. Most work stays on your
              device.
            </p>

            <div className="mt-6 space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Contact
              </p>
              <a
                href="mailto:support.mykittool@gmail.com"
                className="group flex w-fit items-center gap-3 text-sm text-foreground/85 transition-colors hover:text-primary"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-[0_8px_20px_rgba(37,99,235,0.18)] ring-1 ring-primary/20">
                  <Mail className="h-4 w-4" />
                </span>
                support.mykittool@gmail.com
              </a>
              <a
                href="https://whatsapp.com/channel/0029Vb8K2p24Crfd31KVcv26"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-3 text-sm hover:underline"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-white">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 fill-[#25D366]"
                    aria-hidden="true"
                  >
                    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.14-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37A9.86 9.86 0 0 1 2.16 11.9C2.16 6.45 6.6 2.01 12.05 2.01a9.86 9.86 0 0 1 6.99 2.9 9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.89-9.88 9.89zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.17-1.24-6.16-3.49-8.41z" />
                  </svg>
                </span>
                WhatsApp Channel
              </a>

              <div className="flex items-center gap-3 text-sm text-foreground/85">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-500 shadow-[0_8px_20px_rgba(16,185,129,0.16)] ring-1 ring-emerald-500/20">
                  <MapPin className="h-4 w-4" />
                </span>
                Based in Pakistan
              </div>
              <p className="pl-12 text-xs text-muted-foreground">
                We reply within 1–2 days.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-7 md:grid-cols-3">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground">Tools</p>
              <FooterLink href="/all-tools">All Tools</FooterLink>
              <FooterLink href="/single">Single QR</FooterLink>
              <FooterLink href="/bulk">Bulk Mode</FooterLink>
              <FooterLink href="/logo-maker">Logo Maker</FooterLink>
              <FooterLink href="/ocr">Photo to Text</FooterLink>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground">About</p>
              <FooterLink href="/faq">Help Center</FooterLink>
              <FooterLink href="/blog">Studio Guides</FooterLink>
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
              <FooterLink href="/faq">FAQ</FooterLink>
            </div>
            <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
              <p className="text-xs font-medium text-muted-foreground">
                Developer
              </p>
              <p className="text-sm text-muted-foreground">Umar Farooq</p>
              <Link
                href="/donate"
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-all hover:border-primary/40 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                <Coffee className="h-4 w-4" />
                Buy me a coffee
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} My Kit Tool</p>
          <p>Private · No signup · Browser first</p>
        </div>
      </div>
    </footer>
  );
}
