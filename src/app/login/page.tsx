"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Image src="/fwc-logotype.png" alt="FIFA World Cup 2026" width={72} height={72} priority />
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-[var(--gold)] tracking-tight">
              FIFA World Cup 2026
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sticker Album — Personal Tracker
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter access password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[var(--gold)] h-11"
            />
            {error && (
              <p className="text-sm text-[var(--red)]">{error}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={loading || !password}
            className="w-full h-11 font-semibold bg-[var(--gold)] text-[#080d1a] hover:bg-[var(--gold-dim)] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
