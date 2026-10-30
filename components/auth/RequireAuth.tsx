"use client";

import AuthLoadingScreen from "@/components/auth/AuthLoadingScreen";
import BetaExpiredScreen from "@/components/auth/BetaExpiredScreen";
import {
  AUTH_ENTER_LABEL,
  AUTH_SESSION_LABEL,
  isEnteringApp,
} from "@/lib/auth-entry";
import { useAuthStore } from "@/stores/auth.store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [now, setNow] = useState(() => Date.now());
  const [forcedExpiredCode, setForcedExpiredCode] = useState<string | null>(
    null,
  );

  const beta = user?.betaAccess;
  const expired =
    Boolean(forcedExpiredCode) ||
    beta?.status === "expired" ||
    beta?.status === "revoked" ||
    (beta?.status === "active" &&
      beta.expiresAt &&
      new Date(beta.expiresAt).getTime() <= now);

  const remainingLabel = useMemo(() => {
    if (beta?.status !== "active" || !beta.expiresAt) return null;
    const ms = Math.max(0, new Date(beta.expiresAt).getTime() - now);
    if (ms <= 0) return null;
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m remaining`;
  }, [beta, now]);

  useEffect(() => {
    if (!hasCheckedAuth) return;
    if (isAuthenticated || forcedExpiredCode) return;

    const next =
      pathname && pathname.startsWith("/home")
        ? `?next=${encodeURIComponent(pathname)}`
        : "";
    router.replace(`/auth/login${next}`);
  }, [
    forcedExpiredCode,
    hasCheckedAuth,
    isAuthenticated,
    pathname,
    router,
  ]);

  useEffect(() => {
    if (beta?.status !== "active" || !beta.expiresAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, [beta?.expiresAt, beta?.status]);

  useEffect(() => {
    if (!expired || forcedExpiredCode) return;
    const code =
      beta?.status === "revoked"
        ? "BETA_ACCESS_REVOKED"
        : "BETA_ACCESS_EXPIRED";
    setForcedExpiredCode(code);
    localStorage.removeItem("token");
    void logout();
  }, [beta?.status, expired, forcedExpiredCode, logout]);

  if (!hasCheckedAuth) {
    return (
      <AuthLoadingScreen
        label={isEnteringApp() ? AUTH_ENTER_LABEL : AUTH_SESSION_LABEL}
      />
    );
  }

  if (forcedExpiredCode || expired) {
    return (
      <BetaExpiredScreen
        code={
          forcedExpiredCode ||
          (beta?.status === "revoked"
            ? "BETA_ACCESS_REVOKED"
            : "BETA_ACCESS_EXPIRED")
        }
      />
    );
  }

  if (!isAuthenticated) {
    return <AuthLoadingScreen label="Redirecting to sign in" />;
  }

  return (
    <>
      {remainingLabel ? (
        <div className="pointer-events-none fixed bottom-3 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-cyan-400/20 bg-slate-950/80 px-3 py-1.5 text-[11px] font-semibold text-cyan-100 shadow-lg backdrop-blur sm:bottom-4">
          Beta access · {remainingLabel}
        </div>
      ) : null}
      {children}
    </>
  );
}
