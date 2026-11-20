import api from "@/lib/axios";
import {
  BehaviourFlagActionPayload,
  BehaviourOverviewResponse,
} from "@/types/behaviour.types";

export const getBehaviourOverviewService =
  async (): Promise<BehaviourOverviewResponse> => {
    const response = await api.get<BehaviourOverviewResponse>("/behaviour");
    return response.data;
  };

export const confirmBehaviourFlagService = async (
  payload: BehaviourFlagActionPayload,
) => {
  const response = await api.post("/behaviour/flags/confirm", { data: payload });
  return response.data;
};

export const dismissBehaviourFlagService = async (
  payload: BehaviourFlagActionPayload,
) => {
  const response = await api.post("/behaviour/flags/dismiss", { data: payload });
  return response.data;
};
