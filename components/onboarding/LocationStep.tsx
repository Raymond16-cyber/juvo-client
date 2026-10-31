"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding.store";
import {
  COUNTRIES,
  findCountryByName,
  formatTimezoneLabel,
  getTimezonesForCountry,
  type CountryOption,
} from "@/constants/countries";

const fieldClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500";

export default function LocationStep() {
  const { country, timezone, updateField } = useOnboardingStore();
  const selectedCountry = useMemo(
    () => findCountryByName(country) || null,
    [country],
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const timezones = useMemo(
    () => getTimezonesForCountry(selectedCountry || undefined),
    [selectedCountry],
  );

  const filteredCountries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return COUNTRIES;
    return COUNTRIES.filter(
      (item) =>
        item.name.toLowerCase().includes(needle) ||
        item.code.toLowerCase().includes(needle),
    );
  }, [query]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!selectedCountry) return;
    if (!timezone || !selectedCountry.timezones.includes(timezone)) {
      updateField("timezone", selectedCountry.timezones[0] || "UTC");
    }
  }, [selectedCountry, timezone, updateField]);

  function selectCountry(next: CountryOption) {
    updateField("country", next.name);
    updateField("timezone", next.timezones[0] || "UTC");
    setQuery("");
    setOpen(false);
  }

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-primary">Step 1 of 6</p>

        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
          Where are you based?
        </h1>

        <p className="mt-3 text-slate-500 dark:text-slate-400">
          This helps JUVO personalize your trading calendar, timezone and
          reminders.
        </p>
      </div>

      <div className="space-y-5">
        <div ref={rootRef} className="relative">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Country
          </label>

          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className={`${fieldClassName} flex items-center justify-between gap-3 text-left`}
          >
            <span className="flex min-w-0 items-center gap-3">
              {selectedCountry ? (
                <>
                  <span className="text-xl leading-none" aria-hidden="true">
                    {selectedCountry.flag}
                  </span>
                  <span className="truncate">{selectedCountry.name}</span>
                </>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">
                  Select your country
                </span>
              )}
            </span>
            <ChevronDown
              size={18}
              className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open ? (
            <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0b1220]">
              <div className="border-b border-slate-100 p-2 dark:border-white/10">
                <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5">
                  <Search size={16} className="text-slate-400" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search countries"
                    className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                  />
                </label>
              </div>

              <ul
                role="listbox"
                aria-label="Countries"
                className="max-h-64 overflow-y-auto py-1"
              >
                {filteredCountries.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-slate-500">
                    No countries match that search.
                  </li>
                ) : (
                  filteredCountries.map((item) => {
                    const active = selectedCountry?.code === item.code;
                    return (
                      <li key={item.code}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => selectCountry(item)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-white/5 ${
                            active
                              ? "bg-primary/10 text-slate-950 dark:text-white"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <span className="text-xl leading-none" aria-hidden="true">
                            {item.flag}
                          </span>
                          <span className="truncate">{item.name}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Timezone
          </label>

          <select
            value={timezone}
            disabled={!selectedCountry}
            onChange={(event) => updateField("timezone", event.target.value)}
            className={`${fieldClassName} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {!selectedCountry ? (
              <option value="">Select a country first</option>
            ) : (
              timezones.map((zone) => (
                <option key={zone} value={zone}>
                  {formatTimezoneLabel(zone)}
                </option>
              ))
            )}
          </select>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {selectedCountry
              ? "Scroll the list to pick a timezone for your selected country."
              : "Choose a country to see its timezones."}
          </p>
        </div>
      </div>
    </div>
  );
}
