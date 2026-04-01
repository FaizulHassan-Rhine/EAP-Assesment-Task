"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { ScrollText, Package, ShoppingCart, RefreshCw, User, Clock } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui";

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    return isToday ? "Today" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch { return ""; }
}

function typeIcon(meta) {
  const t = meta?.type;
  if (t === "order")   return <ShoppingCart className="h-3.5 w-3.5" />;
  if (t === "product" || t === "restock") return <RefreshCw className="h-3.5 w-3.5" />;
  if (t === "auth")    return <User className="h-3.5 w-3.5" />;
  if (t === "category") return <Package className="h-3.5 w-3.5" />;
  return <ScrollText className="h-3.5 w-3.5" />;
}

function typeColor(meta) {
  const t = meta?.type;
  if (t === "order")    return "bg-indigo-500/10 text-indigo-400";
  if (t === "product")  return "bg-emerald-500/10 text-emerald-400";
  if (t === "restock")  return "bg-amber-500/10 text-amber-400";
  if (t === "auth")     return "bg-blue-500/10 text-blue-400";
  if (t === "category") return "bg-violet-500/10 text-violet-400";
  return "bg-slate-500/10 text-slate-400";
}

export default function ActivityPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["activity"],
    queryFn: () => apiGet("/api/activity?limit=20"),
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Recent system actions, latest first."
        action={
          <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs text-slate-400"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            <Clock className="h-3.5 w-3.5" />
            Last 20 events
          </div>
        }
      />

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="divide-y" style={{ borderColor: "rgb(var(--border))" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-3/4 rounded bg-slate-800" />
                  <div className="h-2.5 w-1/4 rounded bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={ScrollText} title="No activity yet" description="Actions like orders, stock updates, and logins will appear here." />
        ) : (
          <ul className="divide-y" style={{ borderColor: "rgb(var(--border))" }}>
            {items.map((a, idx) => (
              <li
                key={a._id}
                className="flex items-start gap-4 px-5 py-4 transition hover:bg-white/[0.02]"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                {/* Icon */}
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeColor(a.meta)}`}>
                  {typeIcon(a.meta)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-200">{a.message}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span>{formatDate(a.createdAt)}</span>
                    <span className="opacity-40">·</span>
                    <span className="font-mono">{formatTime(a.createdAt)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
