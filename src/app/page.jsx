import Link from "next/link";
import { Boxes, BarChart3, Package, ShoppingCart, RefreshCw, ArrowRight } from "lucide-react";

const features = [
  { icon: Package,     title: "Product Management",  desc: "Manage catalog, pricing, stock levels and availability." },
  { icon: ShoppingCart,title: "Order Fulfillment",   desc: "Create orders, track status, and auto-deduct stock." },
  { icon: RefreshCw,   title: "Restock Queue",        desc: "Smart priority queue for low-stock items." },
  { icon: BarChart3,   title: "Live Analytics",       desc: "Revenue charts and order insights at a glance." },
];

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[rgb(9,9,18)] px-4 text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-indigo-600/10 blur-[120px]" />

      {/* Nav */}
      <nav className="relative z-10 flex w-full max-w-5xl items-center justify-between py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
            <Boxes className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-white">SmartInventory</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center py-20 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Full-stack Inventory System
        </div>

        <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Manage Inventory &amp;{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Orders at Scale
          </span>
        </h1>

        <p className="mb-10 max-w-xl text-base text-slate-400 sm:text-lg">
          Track products, stock levels, customer orders and fulfillment workflows — all in one clean, fast workspace.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/login"
            className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-500"
          >
            Sign in to your workspace
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/register"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
          >
            Create free account
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="relative z-10 w-full max-w-5xl pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-sm transition hover:bg-white/[0.05]"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/15">
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <p className="mb-1 text-sm font-semibold text-white">{title}</p>
              <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
