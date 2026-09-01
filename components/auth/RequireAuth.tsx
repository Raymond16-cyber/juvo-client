"use client";

import AuthLoadingScreen from "@/components/auth/AuthLoadingScreen";
import { useAuthStore } from "@/stores/auth.store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!hasCheckedAuth) return;
    if (isAuthenticated) return;

    const next =
      pathname && pathname.startsWith("/home")
        ? `?next=${encodeURIComponent(pathname)}`
        : "";
    router.replace(`/auth/login${next}`);
  }, [hasCheckedAuth, isAuthenticated, pathname, router]);

  if (!hasCheckedAuth) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthLoadingScreen label="Redirecting to sign in" />;
  }

  return children;
}
