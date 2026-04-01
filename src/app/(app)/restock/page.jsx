"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";
import { useState } from "react";
import { RefreshCw, Trash2, PackageSearch } from "lucide-react";
import { PageHeader, EmptyState, TableSkeleton, StatusBadge } from "@/components/ui";

const priorityLabel = { high: "High", medium: "Medium", low: "Low" };

export default function RestockPage() {
  const qc = useQueryClient();
  const [qty, setQty] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["restock"],
    queryFn: () => apiGet("/api/restock?limit=50"),
  });

  const restockMut = useMutation({
    mutationFn: ({ productId, quantity }) => apiPatch(`/api/restock/${productId}/restock`, { quantity }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["restock"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });

  const removeMut = useMutation({
    mutationFn: (productId) => apiDelete(`/api/restock/${productId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["restock"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });

  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restock Queue"
        description="Products below minimum stock threshold — ordered by priority."
        action={
          total > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
              {total} item{total !== 1 ? "s" : ""} need attention
            </div>
          )
        }
      />

      <div className="card overflow-x-auto">
        <table className="data-table min-w-[680px]">
          <thead>
            <tr>
              <th>Product</th>
              <th>Current stock</th>
              <th>Min. threshold</th>
              <th>Priority</th>
              <th>Add stock</th>
              <th className="text-right">Remove</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton cols={6} rows={5} />
            ) : (data?.items ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="p-0 border-0">
                  <EmptyState
                    icon={PackageSearch}
                    title="Queue is empty — great job!"
                    description="All products are above their minimum thresholds."
                  />
                </td>
              </tr>
            ) : (
              (data?.items ?? []).map((row) => {
                const p = row.productId;
                if (!p) return null;
                const id = p._id;
                const pct = p.minThreshold > 0 ? Math.round((p.stock / p.minThreshold) * 100) : 0;
                return (
                  <tr key={row._id ?? id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                          <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{p.name}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="h-1 w-24 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  row.priority === "high" ? "bg-red-500" : row.priority === "medium" ? "bg-amber-500" : "bg-slate-500"
                                }`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500">{pct}% of threshold</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`font-semibold ${p.stock === 0 ? "text-red-400" : "text-amber-400"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="text-slate-400">{p.minThreshold}</td>
                    <td>
                      <StatusBadge status={row.priority} label={priorityLabel[row.priority] ?? row.priority} />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <input
                          type="number" min={1}
                          value={qty[id] ?? ""}
                          placeholder="Qty"
                          onChange={(e) => setQty((q) => ({ ...q, [id]: e.target.value }))}
                          className="field w-20 py-1.5 text-sm text-center"
                        />
                        <button
                          type="button"
                          onClick={() => { const n = Number(qty[id] || 1); restockMut.mutate({ productId: id, quantity: n }); }}
                          className="btn-primary gap-1.5 px-3 py-1.5 text-xs"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Restock
                        </button>
                      </div>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => removeMut.mutate(id)}
                        title="Remove from queue"
                        className="btn-ghost p-1.5 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
