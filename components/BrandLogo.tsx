"use client";

import images from "@/constants/images.service";
import { cn } from "@/lib/ui";
import Image from "next/image";

type BrandLogoProps = {
  size?: number;
  className?: string;
  /** Decorative plate behind the white mark so it stays visible in light mode. */
  plateClassName?: string;
  priority?: boolean;
  alt?: string;
};

/**
 * JUVO mark is a light/white asset. Always seat it on a navy/cyan plate
 * so it remains readable in light and dark themes.
 */
export default function BrandLogo({
  size = 40,
  className,
  plateClassName,
  priority = false,
  alt = "JUVO logo",
}: BrandLogoProps) {
  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-xl border border-cyan-400/25 bg-[#07101d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        plateClassName,
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={images.appLogo}
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        className="h-[72%] w-[72%] object-contain"
      />
    </span>
  );
}
