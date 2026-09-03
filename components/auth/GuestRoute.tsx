"use client";

import AuthLoadingScreen from "@/components/auth/AuthLoadingScreen";
import { AUTH_ENTER_LABEL } from "@/lib/auth-entry";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GuestRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const destination = user?.onboarding?.completed
    ? "/home/dashboard"
    : "/home/onboarding";

  useEffect(() => {
    if (!hasCheckedAuth) return;
    if (isAuthenticated) {
      router.replace(destination);
    }
  }, [destination, hasCheckedAuth, isAuthenticated, router]);

  if (!hasCheckedAuth) {
    return <AuthLoadingScreen label="Just a moment" />;
  }

  if (isAuthenticated) {
    return <AuthLoadingScreen label={AUTH_ENTER_LABEL} />;
  }

  return children;
}
