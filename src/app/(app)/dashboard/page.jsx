"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { formatBDT } from "@/lib/currency";
import { PageHeader, StatusBadge, EmptyState } from "@/components/ui";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  ShoppingBag, Package, TrendingUp, AlertTriangle,
  ArrowUpRight, BarChart3,
} from "lucide-react";

function StatCard({ title, value, icon: Icon, color = "indigo", trend }) {
  const colors = {
    indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", ring: "ring-indigo-500/20" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", ring: "ring-emerald-500/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", ring: "ring-amber-500/20" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-400", ring: "ring-rose-500/20" },
  };
  const c = colors[color] ?? colors.indigo;

  return (
    <div className="card p-5 transition hover:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-2xl font-bold text-white truncate">{value}</p>
          {trend && <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">{trend}</p>}
        </div>
        <div className={`shrink-0 rounded-xl p-2.5 ring-1 ${c.bg} ${c.ring}`}>
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900 p-3 shadow-xl text-xs">
      <p className="mb-2 font-semibold text-slate-300">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-medium">{p.name === "Revenue" ? formatBDT(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-3 w-24 rounded bg-slate-800" />
          <div className="h-7 w-32 rounded bg-slate-800" />
        </div>
        <div className="h-10 w-10 rounded-xl bg-slate-800" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiGet("/api/dashboard/stats"),
  });

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-red-400">Failed to load dashboard. Please refresh.</p>
      </div>
    );
  }

  const chartData = data?.chart?.map((d) => ({
    date: d._id?.slice(5),
    Revenue: Math.round(d.revenue * 100) / 100,
    Orders: d.orders,
  })) ?? [];

  return (
    <div className="space-y-7">
      <PageHeader
        title="Dashboard"
        description="Live overview of orders, revenue, and stock health."
        action={
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Orders Today" value={data.ordersToday} icon={ShoppingBag} color="indigo" />
            <StatCard
              title="Pending / Completed"
              value={`${data.pendingOrders} / ${data.completedOrders}`}
              icon={Package}
              color="amber"
              trend="Pending + confirmed · Shipped + delivered"
            />
            <StatCard
              title="Low Stock Items"
              value={data.lowStockCount}
              icon={AlertTriangle}
              color={data.lowStockCount > 0 ? "rose" : "emerald"}
            />
            <StatCard title="Revenue Today" value={formatBDT(data.revenueToday)} icon={TrendingUp} color="emerald" />
          </>
        )}
      </div>

      {/* Chart */}
      <div className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-white">Orders &amp; Revenue — Last 7 days</h2>
          </div>
        </div>
        {isLoading ? (
          <div className="h-64 animate-pulse rounded-xl bg-slate-800" />
        ) : chartData.length === 0 ? (
          <EmptyState icon={BarChart3} title="No data yet" description="Place orders to see revenue analytics." />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} width={30} />
                <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Line yAxisId="left" type="monotone" dataKey="Orders" stroke="#818cf8" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="Revenue" stroke="#34d399" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Product summary */}
      <div className="card overflow-hidden">
        <div className="border-b px-6 py-4" style={{ borderColor: "rgb(var(--border))" }}>
          <h2 className="text-sm font-semibold text-white">Low Stock Summary</h2>
          <p className="mt-0.5 text-xs text-slate-500">Products below minimum threshold</p>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-40 rounded bg-slate-800" />
                <div className="h-4 w-24 rounded bg-slate-800" />
              </div>
            ))}
          </div>
        ) : (data?.productSummary ?? []).length === 0 ? (
          <EmptyState icon={Package} title="All stock levels look healthy!" description="No products below minimum threshold." />
        ) : (
          <ul>
            {data.productSummary.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-4 px-6 py-3.5 text-sm border-b last:border-0 hover:bg-white/[0.02] transition"
                style={{ borderColor: "rgb(var(--border))" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                    <Package className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <span className="font-medium text-slate-200 truncate">{p.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-500">{p.stock} left</span>
                  <StatusBadge
                    status={p.label === "Out of Stock" ? "out_of_stock" : p.label === "OK" ? "active" : "pending"}
                    label={p.label}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
