"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useState } from "react";
import { FolderTree, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { PageHeader, SearchInput, EmptyState, TableSkeleton } from "@/components/ui";

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [name, setName]     = useState("");
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["categories", search],
    queryFn: () => {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      return apiGet(`/api/categories?${q}`);
    },
  });

  const createMut = useMutation({
    mutationFn: (body) => apiPost("/api/categories", body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); setName(""); },
  });

  const patchMut = useMutation({
    mutationFn: ({ id, name: n }) => apiPatch(`/api/categories/${id}`, { name: n }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); setEditing(null); },
  });

  const delMut = useMutation({
    mutationFn: (id) => apiDelete(`/api/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  function startEdit(c) { setEditing(c._id); setEditVal(c.name); }
  function cancelEdit() { setEditing(null); setEditVal(""); }

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Organise products by category (e.g. Electronics, Grocery)." />

      {/* Add form */}
      <form
        onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; createMut.mutate({ name: name.trim() }); }}
        className="card flex flex-wrap items-end gap-3 p-5"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1.5 block text-xs font-medium text-slate-400">New category name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Electronics"
            className="field"
          />
        </div>
        <button type="submit" disabled={createMut.isPending} className="btn-primary gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          {createMut.isPending ? "Adding…" : "Add category"}
        </button>
      </form>

      {/* Search */}
      <div className="flex items-center gap-3">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories…"
        />
        {data && (
          <p className="shrink-0 text-xs text-slate-500">{data.total} total</p>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Category name</th>
              <th className="w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton cols={2} rows={5} />
            ) : (data?.items ?? []).length === 0 ? (
              <tr>
                <td colSpan={2} className="p-0 border-0">
                  <EmptyState icon={FolderTree} title="No categories yet" description="Add your first category above." />
                </td>
              </tr>
            ) : (
              (data?.items ?? []).map((c) => (
                <tr key={c._id}>
                  <td>
                    {editing === c._id ? (
                      <input
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") patchMut.mutate({ id: c._id, name: editVal });
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        className="field max-w-xs py-1.5 text-sm"
                      />
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10">
                          <FolderTree className="h-3.5 w-3.5 text-indigo-400" />
                        </div>
                        <span className="font-medium text-slate-200">{c.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-1">
                      {editing === c._id ? (
                        <>
                          <button type="button"
                            onClick={() => patchMut.mutate({ id: c._id, name: editVal })}
                            className="btn-ghost p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={cancelEdit}
                            className="btn-ghost p-1.5"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEdit(c)}
                            className="btn-ghost p-1.5"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={() => delMut.mutate(c._id)}
                            className="btn-ghost p-1.5 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
