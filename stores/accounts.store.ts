import { getSelectedAccount, isAccountInPlay } from "@/lib/account";
import {
  activateTradingAccountService,
  createTradingAccountService,
  deleteTradingAccountService,
  getTradingAccountsService,
} from "@/services/trading-account.service";
import {
  CreateTradingAccountPayload,
  TradingAccount,
} from "@/types/trading-account.types";
import { create } from "zustand";

const SELECTED_ACCOUNT_KEY = "juvo.selectedAccountId";

function readStoredAccountId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SELECTED_ACCOUNT_KEY);
}

function persistAccountId(accountId: string | null) {
  if (typeof window === "undefined") return;
  if (accountId) {
    window.localStorage.setItem(SELECTED_ACCOUNT_KEY, accountId);
  } else {
    window.localStorage.removeItem(SELECTED_ACCOUNT_KEY);
  }
}

interface AccountsStore {
  accounts: TradingAccount[];
  selectedAccountId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<TradingAccount[]>;
  createAccount: (data: CreateTradingAccountPayload) => Promise<TradingAccount>;
  selectAccount: (accountId: string) => Promise<TradingAccount | null>;
  activateAccount: (accountId: string) => Promise<TradingAccount>;
  deleteAccount: (accountId: string) => Promise<void>;
}

function resolveSelectedId(accounts: TradingAccount[], preferredId?: string | null) {
  return getSelectedAccount(accounts, preferredId)?._id || null;
}

export const useAccountsStore = create<AccountsStore>((set, get) => ({
  accounts: [],
  selectedAccountId: null,
  isLoading: false,
  error: null,
  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getTradingAccountsService();
      const selectedAccountId = resolveSelectedId(
        response.data,
        get().selectedAccountId || readStoredAccountId(),
      );
      persistAccountId(selectedAccountId);
      set({ accounts: response.data, selectedAccountId, isLoading: false });
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
      set((state) => {
        const accounts = [
          response.data,
          ...state.accounts.map((account) =>
            response.data.isActive ? { ...account, isActive: false } : account,
          ),
        ];
        const selectedAccountId = response.data._id;
        persistAccountId(selectedAccountId);
        return {
          accounts,
          selectedAccountId,
          isLoading: false,
        };
      });
      return response.data;
    } catch (error) {
      void error;
      set({ error: "Unable to create trading account.", isLoading: false });
      throw error;
    }
  },
  selectAccount: async (accountId) => {
    const account = get().accounts.find((item) => item._id === accountId);
    if (!account) return null;

    persistAccountId(accountId);
    set({ selectedAccountId: accountId, error: null });

    if (isAccountInPlay(account)) {
      try {
        const response = await activateTradingAccountService(accountId);
        set((state) => ({
          accounts: state.accounts.map((item) =>
            item._id === accountId
              ? { ...item, ...response.data, isActive: true }
              : { ...item, isActive: false },
          ),
        }));
        return { ...account, ...response.data, isActive: true };
      } catch (error) {
        void error;
      }
    }

    return account;
  },
  activateAccount: async (accountId) => {
    const selected = await get().selectAccount(accountId);
    if (!selected) {
      throw new Error("Trading account not found.");
    }
    return selected;
  },
  deleteAccount: async (accountId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTradingAccountService(accountId);
      set((state) => {
        const accounts = state.accounts.filter((account) => account._id !== accountId);
        const selectedAccountId = resolveSelectedId(
          accounts,
          state.selectedAccountId === accountId ? null : state.selectedAccountId,
        );
        persistAccountId(selectedAccountId);
        return { accounts, selectedAccountId, isLoading: false };
      });
    } catch (error) {
      void error;
      set({ error: "Unable to delete trading account.", isLoading: false });
      throw error;
    }
  },
}));
