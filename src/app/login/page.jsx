"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Boxes, Eye, EyeOff, ArrowRight, Zap } from "lucide-react";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [pending, setPending]   = useState(false);

  if (loading) return null;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setPending(false);
    }
  }

  function fillDemo() {
    setEmail("demo@inventory.local");
    setPassword("demo123");
  }

  return (
    <div className="flex min-h-screen" style={{ background: "rgb(var(--bg))" }}>
      {/* Left panel – decorative */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "rgb(var(--surface))", borderRight: "1px solid rgb(var(--border))" }}
      >
        <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
            <Boxes className="h-5 w-5 text-white" />
          </div>
          <span className="text-base font-semibold text-white">SmartInventory</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Run your inventory<br />like a pro.
          </h2>
          <p className="mt-4 text-slate-400 leading-relaxed max-w-sm">
            Real-time stock tracking, smart restock queues, and order management — all in one workspace.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {["Auto stock deduction on orders", "Low stock restock queue", "Revenue analytics"].map((t) => (
              <div key={t} className="flex items-center gap-2.5 text-sm text-slate-300">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                {t}
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-slate-600">© {new Date().getFullYear()} SmartInventory</p>
      </div>

      {/* Right panel – form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
            <Boxes className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-white">SmartInventory</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-400">Sign in to your workspace</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Email address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="field"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="btn-primary w-full justify-center py-3 disabled:opacity-60"
            >
              {pending ? "Signing in…" : (
                <>Sign in <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: "rgb(var(--border))" }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-muted))" }}>
                or try demo
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={fillDemo}
            className="btn-outline w-full justify-center gap-2 py-2.5"
          >
            <Zap className="h-4 w-4 text-amber-400" />
            Fill demo credentials
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            No account?{" "}
            <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
