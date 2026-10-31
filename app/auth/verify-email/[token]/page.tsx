"use client";

import AuthShell from "@/components/auth/AuthShell";
import styles from "@/components/auth/AuthShell.module.css";
import { getApiErrorMessage } from "@/lib/axios";
import { verifyEmail } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function VerifyEmailPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const startedRef = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("This verification link is invalid or expired.");
        return;
      }

      try {
        const response = await verifyEmail(token);
        setMessage(response.message);
        setStatus("success");
        if (isAuthenticated) {
          try {
            await fetchCurrentUser();
          } catch {
            // Session refresh is best-effort after verification.
          }
        }
      } catch (error) {
        setMessage(
          getApiErrorMessage(
            error,
            "This verification link is invalid or expired.",
          ),
        );
        setStatus("error");
      }
    }

    void verify();
  }, [fetchCurrentUser, isAuthenticated, token]);

  const successHref = isAuthenticated
    ? user?.onboarding?.completed
      ? "/home/dashboard"
      : "/home/onboarding"
    : "/auth/login?verified=1";

  return (
    <AuthShell variant="verify">
      <div className={`${styles.intro} text-center`}>
        <p className={styles.kicker}>JUVO account</p>
        <h1>
          {status === "loading"
            ? "Verifying email..."
            : status === "success"
              ? "Email verified"
              : "Verification failed"}
        </h1>
        <p>
          {status === "loading"
            ? "Please wait while we confirm your email address."
            : message}
        </p>
      </div>

      {status !== "loading" ? (
        <div className="space-y-3">
          <Link
            href={
              status === "success"
                ? successHref
                : "/auth/verify-email"
            }
            className={styles.submit}
          >
            {status === "success"
              ? isAuthenticated
                ? "Continue to JUVO"
                : "Continue to sign in"
              : "Request a new link"}
          </Link>
          {status === "error" ? (
            <Link href="/auth/login" className={styles.secondary}>
              Back to sign in
            </Link>
          ) : null}
        </div>
      ) : null}
    </AuthShell>
  );
}
