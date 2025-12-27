import { apiClient } from "../lib/apiClient";

export type MeResp = {
  name: string;
  email: string;
};

export async function fetchMe() {
  const { data } = await apiClient.get<MeResp>("/api/members/me");
  return data;
}
