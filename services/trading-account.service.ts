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

export const createTradingAccountService = async (
  data: CreateTradingAccountPayload,
): Promise<CreateTradingAccountResponse> => {
  const response = await api.post<CreateTradingAccountResponse>(
    "/trading-account/create-trading-account",
    { data },
  );

  return response.data;
};

export const deleteTradingAccountService = async (accountId: string) => {
  const response = await api.delete<{ message: string; accountId: string }>(
    `/trading-account/delete-trading-account/${accountId}`,
  );

  return response.data;
};
