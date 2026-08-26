"use client";

import OptionCard from "./OptionCard";
import { CHALLENGES } from "@/constants/onboarding";
import { useOnboardingStore } from "@/stores/onboarding.store";

const labels: Record<string, string> = {
  fomo: "FOMO",
  revenge_trading: "Revenge trading",
  overtrading: "Overtrading",
  impatience: "Impatience",
  poor_risk_management: "Poor risk management",
  emotional_trading: "Emotional trading",
  lack_of_discipline: "Lack of discipline",
  inconsistent_strategy: "Inconsistent strategy",
};

export default function ChallengesStep() {
  const { biggestChallenges, updateField } = useOnboardingStore();

  const toggleChallenge = (challenge: string) => {
    const exists = biggestChallenges.includes(challenge);

    updateField(
      "biggestChallenges",
      exists
        ? biggestChallenges.filter((item) => item !== challenge)
        : [...biggestChallenges, challenge],
    );
  };

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-primary">Step 4 of 6</p>

        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
          What&apos;s holding you back?
        </h1>

        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Select the challenges you experience most.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CHALLENGES.map((challenge) => (
          <OptionCard
            key={challenge}
            label={labels[challenge] ?? challenge}
            selected={biggestChallenges.includes(challenge)}
            onClick={() => toggleChallenge(challenge)}
            multiple
          />
        ))}
      </div>
    </div>
  );
}
