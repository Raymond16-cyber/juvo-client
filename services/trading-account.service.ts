import api from "@/lib/axios";
import {
  CreateTradingAccountPayload,
  CreateTradingAccountResponse,
  TradingAccountsResponse,
} from "@/types/trading-account.types";

export const getTradingAccountsService =
  async (): Promise<TradingAccountsResponse> => {
    const response = await api.get<TradingAccountsResponse>(
      "/trading-account/get-user-trading-accounts",
    );

    return response.data;
  };

export const getArchivedTradingAccountsService =
  async (): Promise<TradingAccountsResponse> => {
    const response = await api.get<TradingAccountsResponse>(
      "/trading-account/archived",
    );

    return response.data;
  };

export const createTradingAccountService = async (
  data: CreateTradingAccountPayload,
): Promise<CreateTradingAccountResponse> => {
  const response = await api.post<CreateTradingAccountResponse>(
    "/trading-account/create-trading-account",
    { data },
  );

  return response.data;
};

export const archiveTradingAccountService = async (accountId: string) => {
  const response = await api.delete<{ message: string; accountId: string }>(
    `/trading-account/delete-trading-account/${accountId}`,
  );

  return response.data;
};

export const deleteTradingAccountService = archiveTradingAccountService;

export const getTradingAccountByIdService = async (
  accountId: string,
): Promise<CreateTradingAccountResponse> => {
  const response = await api.get<CreateTradingAccountResponse>(
    `/trading-account/${accountId}`,
  );

  return response.data;
};

export const activateTradingAccountService = async (
  accountId: string,
): Promise<CreateTradingAccountResponse> => {
  const response = await api.patch<CreateTradingAccountResponse>(
    `/trading-account/${accountId}/activate`,
  );

  return response.data;
};

export const restoreTradingAccountService = async (
  accountId: string,
): Promise<CreateTradingAccountResponse> => {
  const response = await api.patch<CreateTradingAccountResponse>(
    `/trading-account/${accountId}/restore`,
  );

  return response.data;
};
