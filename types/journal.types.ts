export interface JournalSummary {
  _id: string;
  journalDate: string;
  status: "Started" | "Completed";
  tradingAccount?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalStatusData {
  hasJournalToday: boolean;
  journal: JournalSummary | null;
  date: string;
  timeZone: string;
}

export interface JournalStatusResponse {
  data: JournalStatusData;
  message: string;
}
