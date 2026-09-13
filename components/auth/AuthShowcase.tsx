"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { connectAuthVideo } from "@/lib/auth-visual-media";
import styles from "./AuthShell.module.css";

export type AuthVariant = "login" | "register";

export default function AuthShowcase({ variant }: { variant: AuthVariant }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const asset = `/auth/juvo-v1/${variant}`;

  useEffect(() => {
    if (videoRef.current) return connectAuthVideo(videoRef.current, `${asset}-loop.mp4`);
  }, [asset]);

  return (
    <aside className={styles.showcase} aria-label="JUVO product preview">
      <div className={styles.media}>
        <Image
          src={`${asset}-poster.png`}
          alt={variant === "login"
            ? "Illustrative JUVO dashboard with open positions, performance analytics, journal notes and discipline insights."
            : "Illustrative JUVO workflow: a broker-synced trade, journal reflection, behavioral analysis and discipline review."}
          fill
          sizes="(min-width: 1536px) 720px, (min-width: 1024px) 48vw, 1px"
          className={styles.poster}
        />
        <video
          key={variant}
          ref={videoRef}
          className={styles.video}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          controls={false}
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
    </aside>
  );
}
