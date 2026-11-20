"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getVerifyEmailPath } from "@/lib/email-verification";
import { useAuthStore } from "@/stores/auth.store";
import { MailWarning } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

type VerifyEmailGateProps = {
  children: ReactNode;
  featureLabel: string;
  description?: string;
};

export default function VerifyEmailGate({
  children,
  featureLabel,
  description,
}: VerifyEmailGateProps) {
  const user = useAuthStore((state) => state.user);
  const verified = Boolean(user?.emailVerified);

  if (verified) return <>{children}</>;

  return (
    <Card className="p-5 sm:p-6">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/15 text-amber-700 dark:text-amber-200">
        <MailWarning size={22} />
      </div>
      <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
        Verify email to use {featureLabel}
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
        {description ||
          `Confirm ${user?.email || "your email"} to unlock ${featureLabel}. You can keep using your journal and dashboard in the meantime.`}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={getVerifyEmailPath(user?.email)}>
          <Button>Verify email</Button>
        </Link>
        <Link href="/home/general/settings">
          <Button variant="ghost">Open settings</Button>
        </Link>
      </div>
    </Card>
  );
}
