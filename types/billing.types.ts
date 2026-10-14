export type BillingPlan = "free" | "pro" | "super";
export type BillingSubscriptionStatus = "pending" | "active" | "non-renewing" | "past-due" | "cancelled" | "expired";
export type PaymentStatus = "pending" | "processing" | "success" | "failed" | "abandoned" | "reversed";

export interface BillingPlanOption {
  plan: Exclude<BillingPlan, "free">;
  billingInterval: "monthly";
  amount?: number;
  currency?: string;
  available: boolean;
}
export interface BillingSubscription {
  id: string;
  plan: Exclude<BillingPlan, "free">;
  billingInterval: "monthly";
  status: BillingSubscriptionStatus;
  currency: string;
  amount: number;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  cancelledAt?: string | null;
  createdAt?: string;
}
export interface BillingPayment {
  id: string;
  reference: string;
  plan: Exclude<BillingPlan, "free">;
  billingInterval: "monthly";
  expectedAmount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: string | null;
  createdAt?: string;
}
export interface BillingOverview {
  enabled: boolean;
  plans: BillingPlanOption[];
  current: { plan?: BillingPlan; status?: string; startedAt?: string; expiresAt?: string | null };
  subscriptions: BillingSubscription[];
  payments: BillingPayment[];
}
