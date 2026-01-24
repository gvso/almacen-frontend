import type { Tip, TipType } from "@/types/Tip";
import { fetchApi } from "./api";

export async function fetchTips(
  language?: string,
  tipType?: TipType
): Promise<{ data: Tip[] }> {
  const params = new URLSearchParams();
  if (language) params.append("language", language);
  if (tipType) params.append("tip_type", tipType);
  const queryString = params.toString();
  return fetchApi(`/api/v1/tips${queryString ? `?${queryString}` : ""}`);
}
