"use client";

import { animateCounter } from "@/animations/counters";
import { useEffect, useRef } from "react";

type AnimatedCounterProps = {
  value: number;
  formatter?: (value: number) => string;
  className?: string;
  duration?: number;
};

export default function AnimatedCounter({
  value,
  formatter,
  className = "",
  duration,
}: AnimatedCounterProps) {
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    return animateCounter(valueRef.current, { value, formatter, duration });
  }, [duration, formatter, value]);

  return (
    <span ref={valueRef} className={className}>
      {formatter ? formatter(value) : Math.round(value)}
    </span>
  );
}

