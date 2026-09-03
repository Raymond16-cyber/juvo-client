import { TradingAccountStatus } from "@/types/trading-account.types";
import { create } from "zustand";

export type JuvoNoticeTone = "passed" | "breached" | "info" | "success" | "warning";

export type JuvoNotice = {
  id: string;
  title: string;
  body: string;
  tone: JuvoNoticeTone;
  duration: number;
};

type NoticeInput = {
  id?: string;
  title: string;
  body: string;
  tone?: JuvoNoticeTone;
  duration?: number;
};

const SEEN_KEY = "juvo.seenAccountOutcomes";

type SeenMap = Record<string, string>;

function readSeen(): SeenMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as SeenMap) : {};
  } catch {
    return {};
  }
}

function writeSeen(map: SeenMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEEN_KEY, JSON.stringify(map));
}

function outcomeKey(accountId: string, status: string, updatedAt?: string | null) {
  return `${accountId}:${status}:${updatedAt || ""}`;
}

export function hasSeenAccountOutcome(
  accountId: string,
  status: string,
  updatedAt?: string | null,
) {
  return Boolean(readSeen()[outcomeKey(accountId, status, updatedAt)]);
}

export function markAccountOutcomeSeen(
  accountId: string,
  status: string,
  updatedAt?: string | null,
) {
  const map = readSeen();
  map[outcomeKey(accountId, status, updatedAt)] = new Date().toISOString();
  writeSeen(map);
}

interface NoticeStore {
  notices: JuvoNotice[];
  showNotice: (notice: NoticeInput) => string;
  dismissNotice: (id: string) => void;
  clearNotices: () => void;
}

export const useNoticeStore = create<NoticeStore>((set, get) => ({
  notices: [],
  showNotice: (notice) => {
    const id = notice.id || `notice-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const next: JuvoNotice = {
      id,
      title: notice.title,
      body: notice.body,
      tone: notice.tone || "info",
      duration: notice.duration ?? 7000,
    };

    if (get().notices.some((item) => item.id === id)) return id;

    set((state) => ({ notices: [...state.notices, next].slice(-3) }));
    return id;
  },
  dismissNotice: (id) => {
    set((state) => ({
      notices: state.notices.filter((notice) => notice.id !== id),
    }));
  },
  clearNotices: () => set({ notices: [] }),
}));

export function showAccountOutcomeNotice(account: {
  _id: string;
  accountName: string;
  status?: TradingAccountStatus;
  statusUpdatedAt?: string | null;
}) {
  const status = account.status;
  if (status !== "Passed" && status !== "Breached") return;

  if (hasSeenAccountOutcome(account._id, status, account.statusUpdatedAt)) return;

  markAccountOutcomeSeen(account._id, status, account.statusUpdatedAt);

  const passed = status === "Passed";
  useNoticeStore.getState().showNotice({
    id: `account-${account._id}-${status}`,
    tone: passed ? "passed" : "breached",
    title: passed ? "Account passed" : "Account breached",
    body: passed
      ? `${account.accountName} has passed its profit target.`
      : `${account.accountName} has been breached.`,
    duration: 8000,
  });
}
