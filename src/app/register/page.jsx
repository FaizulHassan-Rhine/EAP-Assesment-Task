"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Boxes, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [pending, setPending]   = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await register({ name, email, password });
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: "rgb(var(--bg))" }}>
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
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
            Launch your inventory
            <br />
            workspace today.
          </h2>
          <p className="mt-4 text-slate-400 leading-relaxed max-w-sm">
            Set up your account and start managing products, stock, orders, and fulfillment in one dashboard.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {["Easy onboarding", "Secure account access", "Real-time inventory visibility"].map((t) => (
              <div key={t} className="flex items-center gap-2.5 text-sm text-slate-300">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                {t}
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-slate-600">© {new Date().getFullYear()} SmartInventory</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
            <Boxes className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-white">SmartInventory</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="mt-1 text-sm text-slate-400">Start managing inventory in seconds.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Full name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
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

            <button type="submit" disabled={pending} className="btn-primary w-full justify-center py-3">
              {pending ? "Creating account…" : (
                <>Create account <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
