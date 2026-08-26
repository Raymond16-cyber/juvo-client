import api from "@/lib/axios";
import { JournalStatusResponse } from "@/types/journal.types";

export const getTodayJournalStatusService =
  async (): Promise<JournalStatusResponse> => {
    const response = await api.get<JournalStatusResponse>(
    "/journal/get-today-journal-status",
    );

    return response.data;
  };
