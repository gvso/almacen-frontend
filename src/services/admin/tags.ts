import type {
    AdminTag,
    TagCreateData,
    TagUpdateData,
    TagTranslationData,
    EntityTagAddData,
} from "@/types/Tag";
import { fetchAdminApi } from "./api";

// ============ Reorder Types ============

export interface ReorderItem {
    id: number;
    order: number;
}

// ============ Tag API ============

export async function fetchAdminTags(): Promise<{ data: AdminTag[] }> {
    return fetchAdminApi("/api/v1/admin/tags");
}

export async function createTag(data: TagCreateData): Promise<AdminTag> {
    return fetchAdminApi("/api/v1/admin/tags", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getTag(tagId: number): Promise<AdminTag> {
    return fetchAdminApi(`/api/v1/admin/tags/${tagId}`);
}

export async function updateTag(tagId: number, data: TagUpdateData): Promise<AdminTag> {
    return fetchAdminApi(`/api/v1/admin/tags/${tagId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteTag(tagId: number): Promise<void> {
    return fetchAdminApi(`/api/v1/admin/tags/${tagId}`, {
        method: "DELETE",
    });
}

// ============ Tag Translation API ============

export async function createOrUpdateTagTranslation(
    tagId: number,
    data: TagTranslationData
): Promise<AdminTag> {
    return fetchAdminApi(`/api/v1/admin/tags/${tagId}/translations`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function deleteTagTranslation(
    tagId: number,
    language: string
): Promise<AdminTag> {
    return fetchAdminApi(`/api/v1/admin/tags/${tagId}/translations/${language}`, {
        method: "DELETE",
    });
}

// ============ Reorder API ============

export async function reorderTags(items: ReorderItem[]): Promise<{ data: AdminTag[] }> {
    return fetchAdminApi("/api/v1/admin/tags/reorder", {
        method: "PATCH",
        body: JSON.stringify({ items }),
    });
}

// ============ Product Tags API ============

export async function getProductTags(productId: number): Promise<{ data: AdminTag[] }> {
    return fetchAdminApi(`/api/v1/admin/tags/products/${productId}`);
}

export async function addProductTag(
    productId: number,
    data: EntityTagAddData
): Promise<{ data: AdminTag[] }> {
    return fetchAdminApi(`/api/v1/admin/tags/products/${productId}`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function removeProductTag(
    productId: number,
    tagId: number
): Promise<{ data: AdminTag[] }> {
    return fetchAdminApi(`/api/v1/admin/tags/products/${productId}/tags/${tagId}`, {
        method: "DELETE",
    });
}

// ============ Tip Tags API ============

export async function getTipTags(tipId: number): Promise<{ data: AdminTag[] }> {
    return fetchAdminApi(`/api/v1/admin/tags/tips/${tipId}`);
}

export async function addTipTag(
    tipId: number,
    data: EntityTagAddData
): Promise<{ data: AdminTag[] }> {
    return fetchAdminApi(`/api/v1/admin/tags/tips/${tipId}`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function removeTipTag(
    tipId: number,
    tagId: number
): Promise<{ data: AdminTag[] }> {
    return fetchAdminApi(`/api/v1/admin/tags/tips/${tipId}/tags/${tagId}`, {
        method: "DELETE",
    });
}
