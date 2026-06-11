"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

const TEAM_FLAGS: Record<string, string> = {
  "Mexico": "🇲🇽", "South Africa": "🇿🇦", "South Korea": "🇰🇷", "Czechia": "🇨🇿",
  "Canada": "🇨🇦", "Bosnia and Herzegovina": "🇧🇦", "Qatar": "🇶🇦", "Switzerland": "🇨🇭",
  "Brazil": "🇧🇷", "Morocco": "🇲🇦", "Haiti": "🇭🇹", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "USA": "🇺🇸", "Paraguay": "🇵🇾", "Australia": "🇦🇺", "Türkiye": "🇹🇷",
  "Germany": "🇩🇪", "Curaçao": "🇨🇼", "Ivory Coast": "🇨🇮", "Ecuador": "🇪🇨",
  "Netherlands": "🇳🇱", "Japan": "🇯🇵", "Sweden": "🇸🇪", "Tunisia": "🇹🇳",
  "Belgium": "🇧🇪", "Egypt": "🇪🇬", "Iran": "🇮🇷", "New Zealand": "🇳🇿",
  "Spain": "🇪🇸", "Cape Verde": "🇨🇻", "Saudi Arabia": "🇸🇦", "Uruguay": "🇺🇾",
  "France": "🇫🇷", "Senegal": "🇸🇳", "Iraq": "🇮🇶", "Norway": "🇳🇴",
  "Argentina": "🇦🇷", "Algeria": "🇩🇿", "Austria": "🇦🇹", "Jordan": "🇯🇴",
  "Portugal": "🇵🇹", "Congo DR": "🇨🇩", "Uzbekistan": "🇺🇿", "Colombia": "🇨🇴",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croatia": "🇭🇷", "Ghana": "🇬🇭", "Panama": "🇵🇦",
};

// Exact album order — section name as per DB
const GROUP_TEAMS: Record<string, string[]> = {
  A: ["Mexico", "South Africa", "South Korea", "Czechia"],
  B: ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"],
  C: ["Brazil", "Morocco", "Haiti", "Scotland"],
  D: ["USA", "Paraguay", "Australia", "Türkiye"],
  E: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
  F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
  I: ["France", "Senegal", "Iraq", "Norway"],
  J: ["Argentina", "Algeria", "Austria", "Jordan"],
  K: ["Portugal", "Congo DR", "Uzbekistan", "Colombia"],
  L: ["England", "Croatia", "Ghana", "Panama"],
};

const SECTION_TO_GROUP: Record<string, string> = Object.fromEntries(
  Object.entries(GROUP_TEAMS).flatMap(([group, teams]) =>
    teams.map((team) => [team, group])
  )
);

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

/* ── Circular progress stat ── */
function CircleStat({
  value,
  label,
  pct,
  color,
}: {
  value: number | string;
  label: string;
  pct: number;
  color: string; // CSS variable or hex
}) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 100) / 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8"
            className="text-white/10" />
          {/* Progress */}
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-extrabold leading-none" style={{ color }}>{value}</span>
        </div>
      </div>
      <span className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

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
                <div className="p-2 grid grid-cols-3 gap-1">
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

interface NavItem {
  id: string;
  label: string;
  color: { bg: string; border: string; text: string };
  collected: number;
  total: number;
}

function scrollToGroup(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function GroupNavContent({
  items,
  activeId,
  onNavigate,
}: {
  items: NavItem[];
  activeId: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5 p-2">
      {items.map((item) => {
        const pct = item.total > 0 ? Math.round((item.collected / item.total) * 100) : 0;
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => { scrollToGroup(item.id); onNavigate?.(); }}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all",
              "hover:bg-secondary",
              isActive && "bg-secondary"
            )}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: item.color.border }}
            />
            <span className="flex-1 min-w-0">
              <span className="block text-xs font-semibold leading-tight truncate" style={{ color: item.color.text }}>
                {item.label}
              </span>
              <span className="block text-[0.6rem] text-muted-foreground tabular-nums mt-0.5">
                {item.collected}/{item.total} · {pct}%
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default function Home() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingToggle | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState("group-FWC");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const fetchStickers = useCallback(async () => {
    try {
      const res = await fetch("/api/stickers");
      const data = await res.json();
      setStickers(data.stickers);
    } catch {
      console.error("Failed to load stickers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStickers(); }, [fetchStickers]);

  // Track which group is in view
  useEffect(() => {
    const ids = ["group-FWC", ...GROUPS.map((g) => `group-${g}`), "group-EXTRA"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) { setActiveGroup(entry.target.id); break; }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [loading]);

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

  // Build nav items for sidebar
  const navItems: NavItem[] = [
    {
      id: "group-FWC",
      label: "FWC Special",
      color: GROUP_COLORS.FWC,
      collected: fwcAll.filter((s) => s.collected).length,
      total: fwcAll.length,
    },
    ...GROUPS.map((groupId) => {
      const all = teamSections
        .filter(([sec]) => SECTION_TO_GROUP[sec] === groupId)
        .flatMap(([, list]) => list);
      return {
        id: `group-${groupId}`,
        label: `Group ${groupId}`,
        color: GROUP_COLORS[groupId],
        collected: all.filter((s) => s.collected).length,
        total: all.length,
      };
    }),
    {
      id: "group-EXTRA",
      label: "Extra Stickers",
      color: GROUP_COLORS.EXTRA,
      collected: extraAll.filter((s) => s.collected).length,
      total: extraAll.length,
    },
  ];

  const renderStickerGrid = (list: Sticker[], cols = "repeat(auto-fill,minmax(90px,1fr))") => (
    <div style={{ display: "grid", gridTemplateColumns: cols, gap: "4px", padding: "8px" }}>
      {list.map((s) => (
        <button
          key={s.code}
          className={cn("sticker-btn", s.collected && "collected")}
          onClick={() => setPending({ code: s.code, title: s.title, isCollected: s.collected })}
          title={s.collected ? `${s.code} — click to remove` : `${s.code} — click to add`}
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
          {groupId === "FWC" ? "FWC" : groupId === "EXTRA" ? "EXTRA" : `Group ${groupId}`}
        </Badge>
        <span className="text-sm font-semibold" style={{ color: c.text, opacity: 0.85 }}>{name}</span>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{collected}/{total}</span>
      </div>
    );
  };

  const sidebarNav = (
    <GroupNavContent
      items={navItems}
      activeId={activeGroup}
      onNavigate={() => setMobileNavOpen(false)}
    />
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-(--gold) bg-linear-to-r from-[#060d24] via-[#0e1d44] to-[#060d24]">
        <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile nav trigger */}
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger
                className="lg:hidden inline-flex items-center justify-center border border-border bg-transparent text-muted-foreground rounded-lg p-2 hover:bg-secondary transition-colors"
                aria-label="Open group navigation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-card border-border p-0 overflow-y-auto">
                <SheetHeader className="px-4 py-3 border-b border-border">
                  <SheetTitle className="text-sm font-bold text-(--gold)">Groups</SheetTitle>
                </SheetHeader>
                {sidebarNav}
              </SheetContent>
            </Sheet>

            <Image src="/fwc-logotype.png" alt="FIFA World Cup 2026" width={44} height={44} priority />
            <div>
              <div className="text-base font-extrabold text-(--gold) tracking-tight leading-tight">FIFA World Cup 2026</div>
              <div className="text-[0.7rem] text-muted-foreground hidden sm:block">Sticker Album — Personal Tracker</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-extrabold text-(--gold) leading-none">{pct}%</div>
            <div className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mt-0.5">complete</div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 fixed top-[65px] bottom-0 left-0 border-r border-border bg-card overflow-y-auto z-40">
          <div className="px-3 pt-3 pb-1">
            <span className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-widest px-3">Navigation</span>
          </div>
          {sidebarNav}
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-56 min-w-0">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="px-4 lg:px-6 pb-20">
              {/* Stats */}
              <div className="flex justify-center gap-10 sm:gap-16 pt-6 pb-2">
                <CircleStat
                  value={totalCollected}
                  label="Collected"
                  pct={(totalCollected / total) * 100}
                  color="var(--green)"
                />
                <CircleStat
                  value={`${pct}%`}
                  label="Progress"
                  pct={pct}
                  color="var(--gold)"
                />
                <CircleStat
                  value={total - totalCollected}
                  label="Missing"
                  pct={((total - totalCollected) / total) * 100}
                  color="var(--red)"
                />
              </div>

              {/* Controls */}
              <div className="flex gap-2 pt-4 pb-3 flex-wrap items-center">
                <Input
                  className="flex-1 min-w-[200px] bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-(--gold)"
                  placeholder="Search by code, name or team..."
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
                        filter === f && "bg-(--gold) text-[#080d1a] border-(--gold) hover:bg-(--gold-dim)"
                      )}
                      onClick={() => setFilter(f)}
                    >
                      {f === "all" ? "All" : f === "collected" ? "✓ Collected" : "✗ Missing"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-8 pt-2">
                {/* FWC Special */}
                {fwcVisible.length > 0 && (
                  <section id="group-FWC">
                    {renderGroupHeader("FWC", "FIFA World Cup Special Series", fwcAll.filter((s) => s.collected).length, fwcAll.length)}
                    {renderStickerGrid(fwcVisible, "repeat(auto-fill,minmax(110px,1fr))")}
                  </section>
                )}

                {/* Groups A–L */}
                {GROUPS.map((groupId) => {
                  const color = GROUP_COLORS[groupId];
                  const order = GROUP_TEAMS[groupId];
                  const groupTeams = teamSections
                    .filter(([section]) => SECTION_TO_GROUP[section] === groupId)
                    .sort(([a], [b]) => order.indexOf(a) - order.indexOf(b));

                  if (groupTeams.length === 0) return null;

                  const allGroupStickers = groupTeams.flatMap(([, list]) => list);
                  const groupCollected = allGroupStickers.filter((s) => s.collected).length;

                  const visibleTeams = groupTeams
                    .map(([section, list]) => ({ section, list: sortStickers(applyFilter(list)) }))
                    .filter(({ list }) => list.length > 0);

                  if (visibleTeams.length === 0) return null;

                  return (
                    <section key={groupId} id={`group-${groupId}`}>
                      {renderGroupHeader(groupId, `${groupTeams.length} teams`, groupCollected, allGroupStickers.length)}
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                        {visibleTeams.map(({ section, list }) => {
                          const teamTotal = teamSections.find(([s]) => s === section)?.[1].length ?? 0;
                          const teamCollected = teamSections.find(([s]) => s === section)?.[1].filter((s) => s.collected).length ?? 0;
                          const isComplete = teamCollected === teamTotal && teamTotal > 0;
                          return (
                            <Card
                              key={section}
                              className={cn(
                                "border-border bg-card overflow-hidden transition-colors py-0 gap-0",
                                isComplete && "border-(--green-dim)"
                              )}
                              style={{ ["--hover-border" as string]: color.border }}
                            >
                              <CardHeader className="flex-row items-center justify-between gap-2 px-3 py-2.5 bg-secondary rounded-none border-b border-border">
                                <span className="flex items-center gap-1.5 flex-1 min-w-0">
                                  {TEAM_FLAGS[section] && (
                                    <span className="text-base leading-none shrink-0">{TEAM_FLAGS[section]}</span>
                                  )}
                                  <span className="text-sm font-bold leading-tight truncate">{section}</span>
                                </span>
                                <span className={cn("text-xs tabular-nums", isComplete ? "text-(--green) font-bold" : "text-muted-foreground")}>
                                  {isComplete ? "✓ Complete" : `${teamCollected}/${teamTotal}`}
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
                  <section id="group-EXTRA">
                    {renderGroupHeader("EXTRA", "Extra Stickers", extraAll.filter((s) => s.collected).length, extraAll.length)}
                    {renderStickerGrid(extraVisible, "repeat(auto-fill,minmax(110px,1fr))")}
                  </section>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent className="bg-slate-950 border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className={pending?.isCollected ? "text-(--red)" : "text-(--green)"}>
              {pending?.isCollected ? "Remove sticker?" : "Add sticker?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              <span className="font-bold text-foreground">{pending?.code}</span>
              {" — "}
              {pending?.title}
              <br />
              {pending?.isCollected
                ? "This sticker will be marked as not collected."
                : "This sticker will be marked as collected in your album."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary border-border text-foreground hover:bg-secondary/80">
              Cancel
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
              {pending?.isCollected ? "Yes, remove" : "Yes, add"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
