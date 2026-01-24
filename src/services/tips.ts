import type { Tip, TipType } from "@/types/Tip";
import { fetchApi } from "./api";

export interface FetchTipsOptions {
  language?: string;
  tipType?: TipType;
  tagIds?: number[];
}

export async function fetchTips(options: FetchTipsOptions = {}): Promise<{ data: Tip[] }> {
  const { language, tipType, tagIds } = options;
  const params = new URLSearchParams();
  if (language) params.append("language", language);
  if (tipType) params.append("tip_type", tipType);
  if (tagIds && tagIds.length > 0) params.append("tag_ids", tagIds.join(","));
  const queryString = params.toString();
  return fetchApi(`/api/v1/tips${queryString ? `?${queryString}` : ""}`);
}
