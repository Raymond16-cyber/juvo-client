"use client";

interface Props {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({ currentStep, totalSteps }: Props) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-10">
      <div className="mb-3 flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>
          Step {currentStep + 1} of {totalSteps}
        </span>

        <span>{Math.round(progress)}%</span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
