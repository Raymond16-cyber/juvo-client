"use client";

type AnimatedProgressProps = {
  value: number;
  className?: string;
};

export default function AnimatedProgress({
  value,
  className = "h-full rounded-full bg-primary",
}: AnimatedProgressProps) {
  return (
    <div
      data-progress-bar
      className={className}
      style={{
        width: `${value}%`,
        transform: "scaleX(0)",
        transformOrigin: "left center",
      }}
    />
  );
}
