import type {
  AdminTip,
  TipCreateData,
  TipUpdateData,
  TipTranslationData,
} from "@/types/Tip";
import { fetchAdminApi } from "./api";

// ============ Reorder Types ============

export interface ReorderItem {
  id: number;
  order: number;
}

// ============ Tip API ============

export async function fetchAdminTips(): Promise<{ data: AdminTip[] }> {
    return fetchAdminApi("/api/v1/admin/tips");
}

export async function createTip(data: TipCreateData): Promise<AdminTip> {
    return fetchAdminApi("/api/v1/admin/tips", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getTip(tipId: number): Promise<AdminTip> {
    return fetchAdminApi(`/api/v1/admin/tips/${tipId}`);
}

export async function updateTip(tipId: number, data: TipUpdateData): Promise<AdminTip> {
    return fetchAdminApi(`/api/v1/admin/tips/${tipId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteTip(tipId: number): Promise<void> {
    return fetchAdminApi(`/api/v1/admin/tips/${tipId}`, {
        method: "DELETE",
    });
}

// ============ Tip Translation API ============

export async function createOrUpdateTipTranslation(
    tipId: number,
    data: TipTranslationData
): Promise<AdminTip> {
    return fetchAdminApi(`/api/v1/admin/tips/${tipId}/translations`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function deleteTipTranslation(
  tipId: number,
  language: string
): Promise<AdminTip> {
  return fetchAdminApi(`/api/v1/admin/tips/${tipId}/translations/${language}`, {
    method: "DELETE",
  });
}

// ============ Reorder API ============

export async function reorderTips(items: ReorderItem[]): Promise<{ data: AdminTip[] }> {
  return fetchAdminApi("/api/v1/admin/tips/reorder", {
    method: "PATCH",
    body: JSON.stringify({ items }),
  });
}
