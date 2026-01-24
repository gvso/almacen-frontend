import type { Tip } from "@/types/Tip";
import { fetchApi } from "./api";

export async function fetchTips(language?: string): Promise<{ data: Tip[] }> {
  const params = new URLSearchParams();
  if (language) params.append("language", language);
  const queryString = params.toString();
  return fetchApi(`/api/v1/tips${queryString ? `?${queryString}` : ""}`);
}
