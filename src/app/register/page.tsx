"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Erro ao criar conta.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
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
              Sticker Album — Criar conta
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              className="bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[var(--gold)] h-11"
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[var(--gold)] h-11"
            />
            {error && (
              <p className="text-sm text-[var(--red)]">{error}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full h-11 font-semibold bg-[var(--gold)] text-[#080d1a] hover:bg-[var(--gold-dim)] disabled:opacity-50"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="text-(--gold) hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
