import api from "@/lib/axios";
import {
  CloseTradePayload,
  CloseTradeResponse,
  CompleteJournalPayload,
  CreateJournalPayload,
  CreateTradePayload,
  CreateTradeResponse,
  JournalDetailResponse,
  JournalExport,
  JournalStatusResponse,
  UserJournalsResponse,
  BeforeTradingAudioResponse,
  BeforeTradingAudioPlaybackResponse,
  ScreenshotReviewResponse,
} from "@/types/journal.types";

export const getJournalExportService = async (): Promise<JournalExport> => {
  const response = await api.get<JournalExport>("/journal/export");
  return response.data;
};

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

export const uploadBeforeTradingAudioService = async (
  journalId: string,
  audioBlob: Blob,
  transcript: string,
): Promise<BeforeTradingAudioResponse> => {
  const formData = new FormData();

  const extension = audioBlob.type.includes("mp4") ? "mp4" : "webm";

  formData.append("audio", audioBlob, `before-trading.${extension}`);
  formData.append("transcript", transcript);

  const response = await api.post<BeforeTradingAudioResponse>(
    `/journal/${journalId}/before-trading-audio`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const getBeforeTradingAudioService = async (
  journalId: string,
): Promise<BeforeTradingAudioPlaybackResponse> => {
  const response = await api.get<BeforeTradingAudioPlaybackResponse>(
    `/journal/${journalId}/before-trading-audio`,
  );

  return response.data;
};

export const analyzeTradeScreenshotService = async (
  journalId: string,
  tradeId: string,
  screenshot: File,
): Promise<ScreenshotReviewResponse> => {
  const formData = new FormData();
  formData.append("screenshot", screenshot);

  const response = await api.post<ScreenshotReviewResponse>(
    `/journal/${journalId}/trades/${tradeId}/screenshot-review`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 70000,
    },
  );

  return response.data;
};

export const getTradeScreenshotReviewService = async (
  journalId: string,
  tradeId: string,
): Promise<ScreenshotReviewResponse> => {
  const response = await api.get<ScreenshotReviewResponse>(
    `/journal/${journalId}/trades/${tradeId}/screenshot-review`,
  );

  return response.data;
};
