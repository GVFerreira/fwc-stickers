"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type Filter = "all" | "collected" | "missing";

interface Sticker {
  code: string;
  title: string;
  section: string;
  type: string;
  collected: boolean;
}

interface PendingToggle {
  code: string;
  title: string;
  isCollected: boolean;
}

function sortStickers(list: Sticker[]): Sticker[] {
  return [...list].sort((a, b) => {
    const numA = parseInt(a.code.replace(/^[A-Z]+/, ""), 10);
    const numB = parseInt(b.code.replace(/^[A-Z]+/, ""), 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.code.localeCompare(b.code);
  });
}

const SECTION_TO_GROUP: Record<string, string> = {
  "Mexico": "A", "South Africa": "A", "South Korea": "A", "Czechia": "A",
  "Canada": "B", "Bosnia and Herzegovina": "B", "Qatar": "B", "Switzerland": "B",
  "Brazil": "C", "Morocco": "C", "Haiti": "C", "Scotland": "C",
  "USA": "D", "Paraguay": "D", "Australia": "D", "Türkiye": "D",
  "Germany": "E", "Curaçao": "E", "Ivory Coast": "E", "Ecuador": "E",
  "Netherlands": "F", "Japan": "F", "Sweden": "F", "Tunisia": "F",
  "Belgium": "G", "Egypt": "G", "Iran": "G", "New Zealand": "G",
  "Spain": "H", "Cape Verde": "H", "Saudi Arabia": "H", "Uruguay": "H",
  "France": "I", "Senegal": "I", "Iraq": "I", "Norway": "I",
  "Argentina": "J", "Algeria": "J", "Austria": "J", "Jordan": "J",
  "Portugal": "K", "Congo DR": "K", "Uzbekistan": "K", "Colombia": "K",
  "England": "L", "Croatia": "L", "Ghana": "L", "Panama": "L",
};

const GROUP_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  FWC:   { bg: "#2a1f00", border: "#f5c842", text: "#f5c842" },
  A:     { bg: "#0d2e18", border: "#1d7a3a", text: "#3ecf6a" },
  B:     { bg: "#2e0d0d", border: "#8c2020", text: "#e05050" },
  C:     { bg: "#2a2000", border: "#8c6e10", text: "#e0b020" },
  D:     { bg: "#0d1a40", border: "#1a3a9a", text: "#4a7ae0" },
  E:     { bg: "#2e1500", border: "#b04010", text: "#e07040" },
  F:     { bg: "#0a2a18", border: "#156e30", text: "#30b860" },
  G:     { bg: "#1e0a30", border: "#6a20a0", text: "#a060d8" },
  H:     { bg: "#003030", border: "#107878", text: "#30c8c8" },
  I:     { bg: "#080e30", border: "#101878", text: "#3050d8" },
  J:     { bg: "#181828", border: "#404068", text: "#8888b8" },
  K:     { bg: "#2a0020", border: "#901060", text: "#d840a0" },
  L:     { bg: "#200808", border: "#6e1010", text: "#c03030" },
  EXTRA: { bg: "#0a1a2a", border: "#2060a0", text: "#60b0e0" },
};

const FWC_SECTIONS = ["We Are Panini", "FIFA World Cup 2026", "Host Countries and Cities", "FIFA World Cup History"];
const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

/* ── Skeleton de carregamento ── */
function LoadingSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-5 pb-20 space-y-8 pt-2">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl bg-secondary" />
        ))}
      </div>
      {/* Search bar */}
      <Skeleton className="h-10 w-full rounded-lg bg-secondary" />
      {/* Groups */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-12 w-full rounded-xl bg-secondary" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="rounded-xl bg-card border border-border overflow-hidden">
                <Skeleton className="h-10 bg-white/70" />
                <div className="p-2 grid grid-cols-4 gap-1">
                  {Array.from({ length: 20 }).map((_, k) => (
                    <Skeleton key={k} className="h-14 bg-white/70 rounded-md" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingToggle | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const fetchStickers = useCallback(async () => {
    try {
      const res = await fetch("/api/stickers");
      const data = await res.json();
      setStickers(data.stickers);
    } catch {
      console.error("Erro ao carregar figurinhas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStickers(); }, [fetchStickers]);

  const confirmToggle = async () => {
    if (!pending) return;
    const { code, isCollected } = pending;
    setPending(null);
    setStickers((prev) =>
      prev.map((s) => s.code === code ? { ...s, collected: !isCollected } : s)
    );
    try {
      await fetch("/api/stickers", {
        method: isCollected ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
    } catch {
      setStickers((prev) =>
        prev.map((s) => s.code === code ? { ...s, collected: isCollected } : s)
      );
    }
  };

  const totalCollected = stickers.filter((s) => s.collected).length;
  const total = stickers.length;
  const pct = total > 0 ? Math.round((totalCollected / total) * 100) : 0;

  const searchLower = search.toLowerCase();

  const applyFilter = (list: Sticker[]) => {
    let result = list;
    if (searchLower) {
      result = result.filter(
        (s) =>
          s.code.toLowerCase().includes(searchLower) ||
          s.title.toLowerCase().includes(searchLower) ||
          s.section.toLowerCase().includes(searchLower)
      );
    }
    if (filter === "collected") result = result.filter((s) => s.collected);
    if (filter === "missing") result = result.filter((s) => !s.collected);
    return result;
  };

  const fwcAll = stickers.filter((s) => FWC_SECTIONS.includes(s.section));
  const fwcVisible = sortStickers(applyFilter(fwcAll));

  const teamSections = Object.entries(
    stickers
      .filter((s) => s.type !== "Extra / Base" && SECTION_TO_GROUP[s.section])
      .reduce<Record<string, Sticker[]>>((acc, s) => {
        acc[s.section] = acc[s.section] ?? [];
        acc[s.section].push(s);
        return acc;
      }, {})
  );

  const extraAll = stickers.filter((s) => s.type === "Extra / Base");
  const extraVisible = sortStickers(applyFilter(extraAll));

  const renderStickerGrid = (list: Sticker[], cols = "repeat(auto-fill,minmax(90px,1fr))") => (
    <div style={{ display: "grid", gridTemplateColumns: cols, gap: "4px", padding: "8px" }}>
      {list.map((s) => (
        <button
          key={s.code}
          className={cn("sticker-btn", s.collected && "collected")}
          onClick={() => setPending({ code: s.code, title: s.title, isCollected: s.collected })}
          title={s.collected ? `${s.code} — clique para remover` : `${s.code} — clique para colar`}
        >
          <span className="sticker-code">{s.code}</span>
          <span className="sticker-title">{s.title}</span>
          {(s.type === "foil" || s.type === "silver") && (
            <span
              className="absolute top-1 right-1 text-[0.45rem] font-bold px-1 py-px rounded border uppercase tracking-wide"
              style={
                s.type === "foil"
                  ? { background: "rgba(245,200,66,0.15)", color: "var(--gold)", borderColor: "rgba(245,200,66,0.3)" }
                  : { background: "rgba(180,190,210,0.15)", color: "#b4bec8", borderColor: "rgba(180,190,210,0.3)" }
              }
            >
              {s.type}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  const renderGroupHeader = (groupId: string, name: string, collected: number, total: number) => {
    const c = GROUP_COLORS[groupId] ?? GROUP_COLORS.FWC;
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 mb-4"
        style={{ background: c.bg, borderColor: c.border, borderTopColor: c.border, borderRightColor: c.border, borderBottomColor: c.border }}
      >
        <Badge
          className="text-[0.62rem] font-extrabold uppercase tracking-widest px-2.5 py-0.5"
          style={{ background: "rgba(255,255,255,0.06)", color: c.text, borderColor: c.border }}
          variant="outline"
        >
          {groupId === "FWC" ? "FWC" : groupId === "EXTRA" ? "EXTRA" : `Grupo ${groupId}`}
        </Badge>
        <span className="text-sm font-semibold" style={{ color: c.text, opacity: 0.85 }}>{name}</span>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{collected}/{total}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-[var(--gold)] bg-gradient-to-r from-[#060d24] via-[#0e1d44] to-[#060d24]">
        <div className="max-w-[1440px] mx-auto px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Image src="/fwc-logotype.png" alt="FIFA World Cup 2026" width={52} height={52} priority />
            <div>
              <div className="text-xl font-extrabold text-[var(--gold)] tracking-tight">FIFA World Cup 2026</div>
              <div className="text-xs text-muted-foreground mt-0.5">Álbum de Figurinhas — Tracker Pessoal</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-[var(--gold)] leading-none">{pct}%</div>
            <div className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mt-0.5">completo</div>
          </div>
        </div>
      </header>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="max-w-[1440px] mx-auto px-5 pb-20">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
            {[
              { label: "Total", value: total, color: "text-[var(--gold)]" },
              { label: "Coladas", value: totalCollected, color: "text-[var(--green)]" },
              { label: "Faltando", value: total - totalCollected, color: "text-[var(--red)]" },
              { label: "Progresso", value: `${pct}%`, color: "text-[var(--gold)]", progress: true },
            ].map(({ label, value, color, progress }) => (
              <Card key={label} className="text-center border-border bg-card py-4">
                <CardContent className="px-4 pt-0 pb-0">
                  <div className={cn("text-3xl font-extrabold leading-none", color)}>{value}</div>
                  <div className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mt-1.5">{label}</div>
                  {progress && (
                    <Progress value={pct} className="mt-3 h-1.5 bg-border" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-2 pt-4 pb-3 flex-wrap items-center">
            <Input
              className="flex-1 min-w-[200px] bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[var(--gold)]"
              placeholder="Buscar por código, nome ou seleção..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "collected", "missing"] as Filter[]).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? "default" : "outline"}
                  className={cn(
                    "border-border text-muted-foreground",
                    filter === f && "bg-[var(--gold)] text-[#080d1a] border-[var(--gold)] hover:bg-[var(--gold-dim)]"
                  )}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "Todas" : f === "collected" ? "✓ Coladas" : "✗ Faltando"}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-8 pt-2">
            {/* FWC Especial */}
            {fwcVisible.length > 0 && (
              <section>
                {renderGroupHeader(
                  "FWC",
                  "Série Especial FIFA World Cup",
                  fwcAll.filter((s) => s.collected).length,
                  fwcAll.length
                )}
                {renderStickerGrid(fwcVisible, "repeat(auto-fill,minmax(110px,1fr))")}
              </section>
            )}

            {/* Grupos A–L */}
            {GROUPS.map((groupId) => {
              const color = GROUP_COLORS[groupId];
              const groupTeams = teamSections
                .filter(([section]) => SECTION_TO_GROUP[section] === groupId)
                .sort(([a], [b]) => a.localeCompare(b));

              if (groupTeams.length === 0) return null;

              const allGroupStickers = groupTeams.flatMap(([, list]) => list);
              const groupCollected = allGroupStickers.filter((s) => s.collected).length;

              const visibleTeams = groupTeams
                .map(([section, list]) => ({ section, list: sortStickers(applyFilter(list)) }))
                .filter(({ list }) => list.length > 0);

              if (visibleTeams.length === 0) return null;

              return (
                <section key={groupId}>
                  {renderGroupHeader(groupId, `${groupTeams.length} seleções`, groupCollected, allGroupStickers.length)}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {visibleTeams.map(({ section, list }) => {
                      const teamTotal = teamSections.find(([s]) => s === section)?.[1].length ?? 0;
                      const teamCollected = teamSections.find(([s]) => s === section)?.[1].filter((s) => s.collected).length ?? 0;
                      const isComplete = teamCollected === teamTotal && teamTotal > 0;
                      return (
                        <Card
                          key={section}
                          className={cn(
                            "border-border bg-card overflow-hidden transition-colors py-0 gap-0",
                            isComplete && "border-[var(--green-dim)]"
                          )}
                          style={{ ["--hover-border" as string]: color.border }}
                        >
                          <CardHeader className="flex-row items-center justify-between gap-2 px-3 py-2.5 bg-secondary rounded-none border-b border-border">
                            <span className="text-sm font-bold flex-1 leading-tight">{section}</span>
                            <span className={cn("text-xs tabular-nums", isComplete ? "text-[var(--green)] font-bold" : "text-muted-foreground")}>
                              {isComplete ? "✓ Completo" : `${teamCollected}/${teamTotal}`}
                            </span>
                          </CardHeader>
                          <CardContent className="p-0">
                            {renderStickerGrid(list)}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {/* Extra Stickers */}
            {extraVisible.length > 0 && (
              <section>
                {renderGroupHeader(
                  "EXTRA",
                  "Extra Stickers",
                  extraAll.filter((s) => s.collected).length,
                  extraAll.length
                )}
                {renderStickerGrid(extraVisible, "repeat(auto-fill,minmax(110px,1fr))")}
              </section>
            )}
          </div>
        </div>
      )}

      {/* Alert Dialog */}
      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent className="bg-slate-950 border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className={pending?.isCollected ? "text-(--red)" : "text-(--green)"}>
              {pending?.isCollected ? "Remover figurinha?" : "Colar figurinha?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              <span className="font-bold text-foreground">{pending?.code}</span>
              {" — "}
              {pending?.title}
              <br />
              {pending?.isCollected
                ? "Esta figurinha será marcada como não colada."
                : "Esta figurinha será marcada como colada no álbum."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary border-border text-foreground hover:bg-secondary/80">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggle}
              className={cn(
                "font-semibold",
                pending?.isCollected
                  ? "bg-(--red) text-white hover:bg-(--red)/80"
                  : "bg-(--green) text-[#080d1a] hover:bg-(--green)/80"
              )}
            >
              {pending?.isCollected ? "Sim, remover" : "Sim, colar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
