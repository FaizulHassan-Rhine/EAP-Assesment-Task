"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user === null) router.replace("/login");
  }, [loading, user, router]);

  if (loading || user === undefined) {
    return <LoadingScreen message="Loading your workspace…" />;
  }

  if (!user) return null;
  return children;
}
