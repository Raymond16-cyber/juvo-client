"use client";

import Button from "@/components/ui/Button";
import {
  dismissEmailVerificationReminder,
  getVerifyEmailPath,
  isEmailVerificationReminderDue,
} from "@/lib/email-verification";
import { useAuthStore } from "@/stores/auth.store";
import { MailWarning, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type EmailVerificationBannerProps = {
  className?: string;
};

export default function EmailVerificationBanner({
  className = "",
}: EmailVerificationBannerProps) {
  const user = useAuthStore((state) => state.user);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user || user.emailVerified) {
      setVisible(false);
      return;
    }
    setVisible(isEmailVerificationReminderDue());
  }, [user]);

  if (!visible || !user || user.emailVerified) return null;

  const verifyHref = getVerifyEmailPath(user.email);

  return (
    <div
      role="status"
      className={`flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-50 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/20 text-amber-700 dark:text-amber-200">
          <MailWarning size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold">Verify your email</p>
          <p className="mt-1 text-sm leading-6 text-amber-900/80 dark:text-amber-50/80">
            You can keep journaling now. Billing, broker connections, exports,
            and referrals stay locked until {user.email || "your email"} is
            verified.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
        <Link href={verifyHref}>
          <Button className="min-h-11 px-4">Verify email</Button>
        </Link>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-amber-300/70 text-amber-800 transition hover:bg-amber-100/80 dark:border-amber-400/30 dark:text-amber-100 dark:hover:bg-amber-400/10"
          aria-label="Dismiss email verification reminder"
          onClick={() => {
            dismissEmailVerificationReminder();
            setVisible(false);
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
