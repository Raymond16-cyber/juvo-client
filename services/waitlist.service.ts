import api from "@/lib/axios";

export async function joinWaitlistService(payload: {
  email: string;
  name?: string;
}) {
  return (
    await api.post<{
      message: string;
      data: { email: string; expiresAt: string };
    }>("/waitlist", payload)
  ).data;
}

export async function retryWaitlistInvitationService(email: string) {
  return (
    await api.post<{
      message: string;
      data: { email: string; expiresAt: string };
    }>("/waitlist/retry", { email })
  ).data;
}
