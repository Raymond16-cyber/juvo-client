import api from "@/lib/axios";
import type { BillingOverview, BillingPlan } from "@/types/billing.types";

export async function getBillingOverviewService() {
  const data = await api.get<{ data: BillingOverview }>("/billing");
  return data.data.data;
}
export async function initializeBillingCheckoutService(plan: Exclude<BillingPlan, "free">, invitationCode?: string) {
  return (await api.post<{ data: { authorizationUrl: string; reference: string } }>("/billing/checkout", { plan, billingInterval: "monthly", ...(invitationCode ? { invitationCode } : {}) })).data.data;
}
export async function validateBillingInvitationService(invitationCode: string) {
  return (await api.post<{ data: { discountPercent: number; expiresAt: string } }>("/billing/invitation/validate", { invitationCode })).data.data;
}
export async function verifyBillingPaymentService(reference: string) {
  return (await api.post("/billing/verify", { reference })).data;
}
export async function reconcileBillingService() {
  return (await api.post<{ data: BillingOverview }>("/billing/reconcile")).data.data;
}
export async function cancelBillingSubscriptionService(subscriptionId: string) {
  return (await api.post(`/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`)).data;
}
export async function getBillingManagementLinkService(subscriptionId: string) {
  return (await api.post<{ data: { url: string } }>(`/billing/subscriptions/${encodeURIComponent(subscriptionId)}/manage`)).data.data;
}
