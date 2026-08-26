"use client";

import OptionCard from "./OptionCard";
import { INSTRUMENTS } from "@/constants/onboarding";
import { useOnboardingStore } from "@/stores/onboarding.store";

const labels: Record<string, string> = {
  forex: "Forex",
  crypto: "Crypto",
  stocks: "Stocks",
  indices: "Indices",
  commodities: "Commodities",
  futures: "Futures",
};

export default function InstrumentsStep() {
  const { instruments, updateField } = useOnboardingStore();

  const toggleInstrument = (instrument: string) => {
    const exists = instruments.includes(instrument);

    updateField(
      "instruments",
      exists
        ? instruments.filter((item) => item !== instrument)
        : [...instruments, instrument],
    );
  };

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-primary">Step 3 of 6</p>

        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
          What do you trade?
        </h1>

        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Select all markets you actively trade.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {INSTRUMENTS.map((instrument) => (
          <OptionCard
            key={instrument}
            label={labels[instrument] ?? instrument}
            selected={instruments.includes(instrument)}
            onClick={() => toggleInstrument(instrument)}
            multiple
          />
        ))}
      </div>

      <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        Select at least one.
      </p>
    </div>
  );
}
