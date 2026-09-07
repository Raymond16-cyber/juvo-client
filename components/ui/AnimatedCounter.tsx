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
  const previousValueRef = useRef<number | null>(null);
  const formatterRef = useRef(formatter);

  useEffect(() => {
    formatterRef.current = formatter;
  }, [formatter]);

  useEffect(() => {
    const fromValue = previousValueRef.current ?? 0;
    previousValueRef.current = value;
    return animateCounter(valueRef.current, {
      value,
      fromValue,
      formatter: (next) => formatterRef.current?.(next) ?? Math.round(next).toString(),
      duration,
    });
  }, [duration, value]);

  return (
    <span ref={valueRef} className={className}>
      {formatter ? formatter(value) : Math.round(value)}
    </span>
  );
}
