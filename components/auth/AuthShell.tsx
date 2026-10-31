import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import images from "@/constants/images.service";
import ThemeToggle from "@/components/ui/ThemeToggle";
import styles from "./AuthShell.module.css";

export type AuthVariant =
  | "login"
  | "register"
  | "forgot"
  | "otp"
  | "reset"
  | "verify";

export default function AuthShell({
  children,
  variant: _variant,
}: {
  children: ReactNode;
  variant?: AuthVariant;
}) {
  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="JUVO home">
          <Image src={images.appLogo} alt="" width={32} height={32} />
          <span>JUVO</span>
        </Link>
        <div title="Appearance">
          <ThemeToggle compact />
        </div>
      </header>

      <div className={styles.formArea}>
        <div className={styles.panel}>
          <section className={styles.content}>{children}</section>
        </div>
      </div>
    </main>
  );
}
