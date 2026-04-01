"use client";

import { Boxes } from "lucide-react";

export function LoadingScreen({ message = "Connecting…" }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5"
      style={{ background: "rgb(var(--bg))" }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[400px] rounded-full bg-indigo-600/8 blur-[120px]" />
      </div>

      {/* Logo */}
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-900/40">
        <Boxes className="h-7 w-7 text-white" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-2xl animate-ping bg-indigo-500/30" />
      </div>

      {/* App name */}
      <div className="text-center">
        <p className="text-base font-semibold text-white">SmartInventory</p>
        <p className="mt-1 text-xs text-slate-500">{message}</p>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-40 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full w-full origin-left animate-[loading_1.4s_ease-in-out_infinite] rounded-full bg-indigo-500" />
      </div>

      <style>{`
        @keyframes loading {
          0%   { transform: scaleX(0)   translateX(0); }
          50%  { transform: scaleX(1)   translateX(0); }
          100% { transform: scaleX(0.1) translateX(900%); }
        }
      `}</style>
    </div>
  );
}
