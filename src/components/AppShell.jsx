"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  RefreshCw,
  ScrollText,
  LogOut,
  Boxes,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/dashboard",  label: "Dashboard",    icon: LayoutDashboard },
  { href: "/categories", label: "Categories",   icon: FolderTree },
  { href: "/products",   label: "Products",     icon: Package },
  { href: "/orders",     label: "Orders",       icon: ShoppingCart },
  { href: "/restock",    label: "Restock Queue",icon: RefreshCw },
  { href: "/activity",   label: "Activity Log", icon: ScrollText },
];

function NavLink({ href, label, icon: Icon, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
        active
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", active && "text-white")} />
      <span className="flex-1">{label}</span>
      {active && <ChevronRight className="h-3 w-3 opacity-60" />}
    </Link>
  );
}

function Sidebar({ onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="flex h-full flex-col" style={{ background: "rgb(var(--surface))" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: "rgb(var(--border))" }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-900/40">
          <Boxes className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">SmartInventory</p>
          <p className="text-[11px] text-slate-500 truncate">Management System</p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Navigation
        </p>
        {nav.map(({ href, label, icon }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={pathname === href || (href !== "/" && pathname.startsWith(href))}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* User */}
      <div className="border-t p-3" style={{ borderColor: "rgb(var(--border))" }}>
        <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-3 bg-white/[0.03]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-bold text-indigo-300">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "rgb(var(--bg))" }}>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r lg:flex lg:flex-col" style={{ borderColor: "rgb(var(--border))" }}>
        <Sidebar />
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ borderColor: "rgb(var(--border))" }}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </aside>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile topbar */}
        <header
          className="flex h-14 items-center gap-3 border-b px-4 lg:hidden"
          style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--border))" }}
        >
          <button type="button" onClick={() => setOpen(true)} className="text-slate-400 hover:text-white">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-semibold text-white">SmartInventory</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
