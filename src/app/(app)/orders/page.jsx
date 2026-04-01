"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import { useMemo, useState } from "react";
import { ShoppingCart, Plus, X, AlertCircle } from "lucide-react";
import { formatBDT } from "@/lib/currency";
import { PageHeader, SearchInput, EmptyState, TableSkeleton, StatusBadge, Pagination } from "@/components/ui";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const statusColor = {
  pending:   "text-amber-400  border-amber-500/30  bg-amber-500/10",
  confirmed: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
  shipped:   "text-blue-400   border-blue-500/30   bg-blue-500/10",
  delivered: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  cancelled: "text-slate-400  border-slate-500/30  bg-slate-500/10",
};

export default function OrdersPage() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate]     = useState("");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [showForm, setShowForm]         = useState(false);

  const { data: products } = useQuery({
    queryKey: ["products", "order-form"],
    queryFn: () => apiGet("/api/products?limit=200"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["orders", filterStatus, filterDate, search, page],
    queryFn: () => {
      const q = new URLSearchParams({ page: String(page), limit: "10" });
      if (filterStatus) q.set("status", filterStatus);
      if (filterDate)   q.set("date", filterDate);
      if (search)       q.set("search", search);
      return apiGet(`/api/orders?${q}`);
    },
  });

  const [customerName, setCustomerName] = useState("");
  const [lines, setLines]               = useState([{ productId: "", quantity: 1 }]);
  const [formError, setFormError]       = useState("");

  const productOptions = products?.items ?? [];

  const createMut = useMutation({
    mutationFn: (body) => apiPost("/api/orders", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
      setCustomerName(""); setLines([{ productId: "", quantity: 1 }]);
      setFormError(""); setShowForm(false);
    },
    onError: (err) => setFormError(err.message || "Could not create order"),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => apiPatch(`/api/orders/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });

  const duplicateIds = useMemo(() => {
    const ids = lines.map((l) => l.productId).filter(Boolean);
    return ids.length !== new Set(ids).size;
  }, [lines]);

  function addLine()        { setLines((l) => [...l, { productId: "", quantity: 1 }]); }
  function removeLine(i)    { setLines((l) => l.filter((_, idx) => idx !== i)); }
  function updateLine(i, f, v) { setLines((l) => l.map((row, idx) => idx === i ? { ...row, [f]: v } : row)); }

  function submitOrder(e) {
    e.preventDefault();
    setFormError("");
    if (duplicateIds) { setFormError("This product is already added to the order."); return; }
    const items = lines.filter((l) => l.productId).map((l) => ({ productId: l.productId, quantity: Number(l.quantity) }));
    if (!items.length) { setFormError("Add at least one product line."); return; }
    createMut.mutate({ customerName: customerName.trim(), items });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Create, manage and fulfil customer orders."
        action={
          <button onClick={() => setShowForm((v) => !v)} className="btn-primary gap-2">
            <Plus className="h-4 w-4" />
            New order
          </button>
        }
      />

      {/* New order form */}
      {showForm && (
        <div className="card p-5">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
              <ShoppingCart className="h-4 w-4 text-indigo-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">New order</h2>
          </div>
          <form onSubmit={submitOrder} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Customer name</label>
              <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" className="field max-w-sm" />
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Line items</p>
              <div className="space-y-2.5">
                {lines.map((line, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <select
                      value={line.productId}
                      onChange={(e) => updateLine(i, "productId", e.target.value)}
                      className="field flex-1 min-w-[200px]"
                    >
                      <option value="">Select product…</option>
                      {productOptions.map((p) => (
                        <option key={p._id} value={p._id} disabled={p.status !== "active" || !p.isListed}>
                          {p.name} — stock: {p.stock}{(p.status !== "active" || !p.isListed) ? " (unavailable)" : ""}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number" min={1}
                      value={line.quantity}
                      onChange={(e) => updateLine(i, "quantity", e.target.value)}
                      className="field w-24 text-center"
                    />
                    <button type="button" onClick={() => removeLine(i)} className="btn-ghost p-2 text-slate-500 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addLine} className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition">
                <Plus className="h-3.5 w-3.5" /> Add line item
              </button>
            </div>

            {duplicateIds && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-400">
                <AlertCircle className="h-4 w-4 shrink-0" /> This product is already added to the order.
              </div>
            )}
            {formError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" /> {formError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button type="submit" disabled={createMut.isPending} className="btn-primary">
                {createMut.isPending ? "Placing…" : "Place order"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search customer or order ID…" />
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="field h-9 w-40 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setPage(1); }} className="field h-9 text-sm w-40" />
        {(filterStatus || filterDate || search) && (
          <button type="button" onClick={() => { setFilterStatus(""); setFilterDate(""); setSearch(""); setPage(1); }} className="btn-ghost h-9 px-3 text-xs text-red-400 hover:bg-red-500/10">
            Clear filters
          </button>
        )}
        {data && <p className="ml-auto text-xs text-slate-500">{data.total} orders</p>}
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="data-table min-w-[720px]">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Update status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton cols={6} rows={6} />
            ) : (data?.items ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="p-0 border-0">
                  <EmptyState icon={ShoppingCart} title="No orders found" description="Create your first order above." />
                </td>
              </tr>
            ) : (
              (data?.items ?? []).map((o) => (
                <tr key={o._id}>
                  <td>
                    <span className="font-mono text-xs font-semibold text-slate-400">
                      #{o._id.toString().slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="font-medium text-slate-200">{o.customerName}</td>
                  <td className="text-xs text-slate-500 max-w-[200px] truncate">
                    {(o.items ?? []).map((it) => `${it.productId?.name ?? "?"} ×${it.quantity}`).join(", ")}
                  </td>
                  <td className="font-semibold text-slate-200">{formatBDT(o.totalPrice)}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td>
                    <select
                      value={o.status}
                      disabled={o.status === "cancelled"}
                      onChange={(e) => statusMut.mutate({ id: o._id, status: e.target.value })}
                      className={`rounded-lg border px-2 py-1 text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed capitalize outline-none ${statusColor[o.status] ?? ""}`}
                      style={{ background: "transparent" }}
                    >
                      {STATUSES.map((s) => <option key={s} value={s} className="bg-slate-900 text-slate-200 capitalize">{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={data?.total} limit={data?.limit} onPage={setPage} />
    </div>
  );
}
