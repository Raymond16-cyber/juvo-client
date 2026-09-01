import {
  createTradingAccountService,
  deleteTradingAccountService,
  getTradingAccountsService,
} from "@/services/trading-account.service";
import {
  CreateTradingAccountPayload,
  TradingAccount,
} from "@/types/trading-account.types";
import { create } from "zustand";

interface AccountsStore {
  accounts: TradingAccount[];
  isLoading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<TradingAccount[]>;
  createAccount: (data: CreateTradingAccountPayload) => Promise<TradingAccount>;
  deleteAccount: (accountId: string) => Promise<void>;
}

export const useAccountsStore = create<AccountsStore>((set) => ({
  accounts: [],
  isLoading: false,
  error: null,
  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getTradingAccountsService();
      set({ accounts: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      void error;
      set({ error: "Unable to load trading accounts.", isLoading: false });
      throw error;
    }
  },
  createAccount: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createTradingAccountService(data);
      set((state) => ({
        accounts: [response.data, ...state.accounts],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      void error;
      set({ error: "Unable to create trading account.", isLoading: false });
      throw error;
    }
  },
  deleteAccount: async (accountId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTradingAccountService(accountId);
      set((state) => ({
        accounts: state.accounts.filter((account) => account._id !== accountId),
        isLoading: false,
      }));
    } catch (error) {
      void error;
      set({ error: "Unable to delete trading account.", isLoading: false });
      throw error;
    }
  },
}));
