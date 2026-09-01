"use client";

import AuthLoadingScreen from "@/components/auth/AuthLoadingScreen";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuthStore } from "@/stores/auth.store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const onboardingDone = Boolean(user?.onboarding?.completed);
  const isOnboardingPath = pathname.startsWith("/home/onboarding");

  useEffect(() => {
    if (!hasCheckedAuth || !isAuthenticated) return;

    if (!onboardingDone && !isOnboardingPath) {
      router.replace("/home/onboarding");
      return;
    }

    if (onboardingDone && isOnboardingPath) {
      router.replace("/home/dashboard");
    }
  }, [
    hasCheckedAuth,
    isAuthenticated,
    isOnboardingPath,
    onboardingDone,
    pathname,
    router,
  ]);

  if (!onboardingDone && !isOnboardingPath) {
    return (
      <RequireAuth>
        <AuthLoadingScreen label="Continue onboarding" />
      </RequireAuth>
    );
  }

  if (onboardingDone && isOnboardingPath) {
    return (
      <RequireAuth>
        <AuthLoadingScreen label="Opening your dashboard" />
      </RequireAuth>
    );
  }

  return <RequireAuth>{children}</RequireAuth>;
}
