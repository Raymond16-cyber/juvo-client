"use client";

import AuthLoadingScreen from "@/components/auth/AuthLoadingScreen";
import { AUTH_ENTER_LABEL } from "@/lib/auth-entry";
import { useAuthStore } from "@/stores/auth.store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GuestRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const isVerifyEmailPath = pathname.startsWith("/auth/verify-email");
  const destination = user?.onboarding?.completed
    ? "/home/dashboard"
    : "/home/onboarding";

  useEffect(() => {
    if (!hasCheckedAuth) return;
    // Allow signed-in users to stay on the verify-email page so they can
    // resend the link or skip into the app intentionally.
    if (isAuthenticated && !isVerifyEmailPath) {
      router.replace(destination);
    }
  }, [
    destination,
    hasCheckedAuth,
    isAuthenticated,
    isVerifyEmailPath,
    router,
  ]);

  if (!hasCheckedAuth) {
    return <AuthLoadingScreen label="Just a moment" />;
  }

  if (isAuthenticated && !isVerifyEmailPath) {
    return <AuthLoadingScreen label={AUTH_ENTER_LABEL} />;
  }

  return children;
}
