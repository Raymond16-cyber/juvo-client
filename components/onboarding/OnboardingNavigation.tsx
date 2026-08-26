"use client";

import Button from "@/components/ui/Button";

interface Props {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

export default function OnboardingNavigation({
  currentStep,
  totalSteps,
  isLoading,
  onBack,
  onNext,
}: Props) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="mt-10 flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={onBack}
        disabled={isFirst || isLoading}
        className="px-4 py-3 text-sm font-semibold text-slate-500 transition hover:text-slate-950 disabled:invisible dark:text-slate-400 dark:hover:text-white"
      >
        Back
      </button>

      <Button type="button" onClick={onNext} disabled={isLoading}>
        {isLoading ? "Saving..." : isLast ? "Finish" : "Continue"}
      </Button>
    </div>
  );
}
