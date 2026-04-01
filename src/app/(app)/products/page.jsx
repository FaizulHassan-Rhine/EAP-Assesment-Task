"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useState } from "react";
import { Package, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatBDT } from "@/lib/currency";
import { PageHeader, SearchInput, EmptyState, TableSkeleton, StatusBadge, Pagination } from "@/components/ui";

export default function ProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data: cats } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => apiGet("/api/categories?limit=100"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", search, page],
    queryFn: () => {
      const q = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) q.set("search", search);
      return apiGet(`/api/products?${q}`);
    },
  });

  const [form, setForm] = useState({ name: "", categoryId: "", price: "", stock: "", minThreshold: "5", isListed: true });
  const [formErr, setFormErr] = useState("");

  const createMut = useMutation({
    mutationFn: (body) => apiPost("/api/products", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setForm({ name: "", categoryId: form.categoryId, price: "", stock: "", minThreshold: "5", isListed: true });
      setFormErr("");
      setShowForm(false);
    },
    onError: (e) => setFormErr(e.message),
  });

  const patchMut = useMutation({
    mutationFn: ({ id, body }) => apiPatch(`/api/products/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const delMut = useMutation({
    mutationFn: (id) => apiDelete(`/api/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  function submit(e) {
    e.preventDefault();
    setFormErr("");
    createMut.mutate({
      name: form.name.trim(),
      categoryId: form.categoryId,
      price: Number(form.price),
      stock: Number(form.stock),
      minThreshold: Number(form.minThreshold),
      isListed: form.isListed,
    });
  }

  function productStatus(p) {
    if (!p.isListed) return "unavailable";
    return p.status;
  }
  function productLabel(p) {
    if (!p.isListed) return "Unavailable";
    return p.status === "out_of_stock" ? "Out of Stock" : "Active";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage catalog, pricing, stock levels and availability."
        action={
          <button onClick={() => setShowForm((v) => !v)} className="btn-primary gap-2">
            <Plus className="h-4 w-4" />
            Add product
          </button>
        }
      />

      {/* Add product form */}
      {showForm && (
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">New product</h2>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Product name</label>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="iPhone 15 Pro" className="field" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Category</label>
              <select required value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className="field">
                <option value="">Select category…</option>
                {(cats?.items ?? []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Price (BDT)</label>
              <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="0.00" className="field" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Stock qty</label>
              <input required type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} placeholder="0" className="field" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Min. threshold</label>
              <input required type="number" min="0" value={form.minThreshold} onChange={(e) => setForm((f) => ({ ...f, minThreshold: e.target.value }))} className="field" />
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2.5 select-none">
                <input type="checkbox" checked={form.isListed} onChange={(e) => setForm((f) => ({ ...f, isListed: e.target.checked }))} className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-indigo-500" />
                <span className="text-sm text-slate-300">Available for sale</span>
              </label>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3">
              <button type="submit" disabled={createMut.isPending} className="btn-primary">
                <Plus className="h-4 w-4" />
                {createMut.isPending ? "Saving…" : "Save product"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              {formErr && <p className="text-xs text-red-400">{formErr}</p>}
            </div>
          </form>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products…" />
        {data && <p className="text-xs text-slate-500">{data.total} products</p>}
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="data-table min-w-[680px]">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton cols={6} rows={6} />
            ) : (data?.items ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="p-0 border-0">
                  <EmptyState icon={Package} title="No products found" description="Add your first product above." />
                </td>
              </tr>
            ) : (
              (data?.items ?? []).map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                        <Package className="h-4 w-4 text-slate-400" />
                      </div>
                      <span className="font-medium text-slate-200">{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge-slate badge">{p.categoryId?.name ?? "—"}</span>
                  </td>
                  <td className="font-medium text-slate-200">{formatBDT(p.price)}</td>
                  <td>
                    <span className={`font-medium ${p.stock <= p.minThreshold && p.stock > 0 ? "text-amber-400" : p.stock === 0 ? "text-red-400" : "text-slate-200"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={productStatus(p)} label={productLabel(p)} />
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => patchMut.mutate({ id: p._id, body: { isListed: !p.isListed } })}
                        title={p.isListed ? "Unlist product" : "List product"}
                        className="btn-ghost p-1.5 text-indigo-400 hover:bg-indigo-500/10"
                      >
                        {p.isListed
                          ? <ToggleRight className="h-4 w-4" />
                          : <ToggleLeft className="h-4 w-4 text-slate-500" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => delMut.mutate(p._id)}
                        className="btn-ghost p-1.5 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
