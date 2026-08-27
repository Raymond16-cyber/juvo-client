import api from "@/lib/axios";
import {
  CreateJournalPayload,
  CreateTradePayload,
  CreateTradeResponse,
  JournalStatusResponse,
  UserJournalsResponse,
} from "@/types/journal.types";

export const getTodayJournalStatusService =
  async (): Promise<JournalStatusResponse> => {
    const response = await api.get<JournalStatusResponse>(
    "/journal/get-today-journal-status",
    );

    return response.data;
  };

export const getUserJournalsService =
  async (): Promise<UserJournalsResponse> => {
    const response = await api.get<UserJournalsResponse>(
      "/journal/get-user-journals",
    );

    return response.data;
  };

export const createJournalService = async (
  data: CreateJournalPayload,
): Promise<JournalStatusResponse> => {
  const response = await api.post<JournalStatusResponse>(
    "/journal/create-journal",
    { data },
  );

  return response.data;
};

export const createJournalTradeService = async (
  journalId: string,
  data: CreateTradePayload,
): Promise<CreateTradeResponse> => {
  const response = await api.post<CreateTradeResponse>(
    `/journal/${journalId}/trades`,
    { data },
  );

  return response.data;
};
