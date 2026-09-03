import api from "@/lib/axios";
import {
  CloseTradePayload,
  CloseTradeResponse,
  CompleteJournalPayload,
  CreateJournalPayload,
  CreateTradePayload,
  CreateTradeResponse,
  JournalDetailResponse,
  JournalStatusResponse,
  UserJournalsResponse,
} from "@/types/journal.types";

export const getTodayJournalStatusService = async (
  tradingAccountId?: string | null,
): Promise<JournalStatusResponse> => {
  const response = await api.get<JournalStatusResponse>(
    "/journal/get-today-journal-status",
    {
      params: tradingAccountId
        ? { tradingAccount: tradingAccountId }
        : undefined,
    },
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

export const getJournalByIdService = async (
  journalId: string,
): Promise<JournalDetailResponse> => {
  const response = await api.get<JournalDetailResponse>(
    `/journal/${journalId}`,
  );

  return response.data;
};

export const completeJournalService = async (
  journalId: string,
  data: CompleteJournalPayload,
): Promise<JournalDetailResponse> => {
  const response = await api.patch<JournalDetailResponse>(
    `/journal/${journalId}/complete`,
    { data },
  );

  return response.data;
};

export const closeJournalTradeService = async (
  journalId: string,
  tradeId: string,
  data: CloseTradePayload,
): Promise<CloseTradeResponse> => {
  const response = await api.patch<CloseTradeResponse>(
    `/journal/${journalId}/trades/${tradeId}/close`,
    { data },
  );

  return response.data;
};
