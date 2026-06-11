import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "FIFA World Cup 2026 — Sticker Album Tracker",
  description: "Track your FIFA World Cup 2026 Panini sticker collection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
