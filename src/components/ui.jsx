"use client";

import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

/* ── Spinner ──────────────────────────────────────────────── */
export function Spinner({ className }) {
  return <Loader2 className={cn("animate-spin", className)} />;
}

/* ── PageHeader ───────────────────────────────────────────── */
export function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-sub">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ── Card ─────────────────────────────────────────────────── */
export function Card({ className, children }) {
  return <div className={cn("card", className)}>{children}</div>;
}

/* ── EmptyState ───────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {Icon && (
        <div className="rounded-2xl bg-slate-800/50 p-4">
          <Icon className="h-8 w-8 text-slate-500" />
        </div>
      )}
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {description && <p className="max-w-xs text-xs text-slate-500">{description}</p>}
    </div>
  );
}

/* ── TableSkeleton ────────────────────────────────────────── */
export function TableSkeleton({ cols = 4, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3.5">
              <div
                className="h-4 rounded-md bg-slate-800 animate-pulse"
                style={{ width: `${60 + Math.random() * 30}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ── StatusBadge ──────────────────────────────────────────── */
const statusMap = {
  active:      "badge-green",
  out_of_stock:"badge-red",
  pending:     "badge-amber",
  confirmed:   "badge-blue",
  shipped:     "badge-blue",
  delivered:   "badge-green",
  cancelled:   "badge-slate",
  unavailable: "badge-slate",
  high:        "badge-red",
  medium:      "badge-amber",
  low:         "badge-slate",
};

export function StatusBadge({ status, label }) {
  const cls = statusMap[status] ?? "badge-slate";
  const text = label ?? status?.replace(/_/g, " ");
  return (
    <span className={cn("badge capitalize", cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {text}
    </span>
  );
}

/* ── Pagination ───────────────────────────────────────────── */
export function Pagination({ page, total, limit, onPage }) {
  if (!total || total <= limit) return null;
  const totalPages = Math.ceil(total / limit);
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="btn-outline px-3 py-1.5 text-xs disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-xs text-slate-500">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="btn-outline px-3 py-1.5 text-xs disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

/* ── SearchInput ──────────────────────────────────────────── */
export function SearchInput({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
      </svg>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="field pl-9 pr-3 h-9 text-sm"
      />
    </div>
  );
}
