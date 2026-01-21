import type {
  AdminProduct,
  ProductCreateData,
  ProductUpdateData,
  ProductType,
  TranslationData,
  VariationCreateData,
  VariationUpdateData,
  VariationTranslationData,
} from "@/types/AdminProduct";
import { fetchAdminApi } from "./api";

// ============ Product API ============

export interface FetchAdminProductsOptions {
  search?: string;
  type?: ProductType;
}

export async function fetchAdminProducts(options?: FetchAdminProductsOptions): Promise<{ data: AdminProduct[] }> {
  const params = new URLSearchParams();
  if (options?.search) params.set("search", options.search);
  if (options?.type) params.set("type", options.type);
  const queryString = params.toString();
  return fetchAdminApi(`/api/v1/admin/products${queryString ? `?${queryString}` : ""}`);
}

export async function createProduct(data: ProductCreateData): Promise<AdminProduct> {
  return fetchAdminApi("/api/v1/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(productId: number, data: ProductUpdateData): Promise<AdminProduct> {
  return fetchAdminApi(`/api/v1/admin/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(productId: number): Promise<void> {
  return fetchAdminApi(`/api/v1/admin/products/${productId}`, {
    method: "DELETE",
  });
}

export async function cloneProduct(productId: number): Promise<AdminProduct> {
  return fetchAdminApi(`/api/v1/admin/products/${productId}/clone`, {
    method: "POST",
  });
}

// ============ Translation API ============

export async function createOrUpdateTranslation(productId: number, data: TranslationData): Promise<AdminProduct> {
  return fetchAdminApi(`/api/v1/admin/products/${productId}/translations`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteTranslation(productId: number, language: string): Promise<AdminProduct> {
  return fetchAdminApi(`/api/v1/admin/products/${productId}/translations/${language}`, {
    method: "DELETE",
  });
}

// ============ Variation API ============

export async function createVariation(productId: number, data: VariationCreateData): Promise<AdminProduct> {
  return fetchAdminApi(`/api/v1/admin/products/${productId}/variations`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateVariation(
  productId: number,
  variationId: number,
  data: VariationUpdateData
): Promise<AdminProduct> {
  return fetchAdminApi(`/api/v1/admin/products/${productId}/variations/${variationId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteVariation(productId: number, variationId: number): Promise<AdminProduct> {
  return fetchAdminApi(`/api/v1/admin/products/${productId}/variations/${variationId}`, {
    method: "DELETE",
  });
}

// ============ Variation Translation API ============

export async function createOrUpdateVariationTranslation(
  productId: number,
  variationId: number,
  data: VariationTranslationData
): Promise<AdminProduct> {
  return fetchAdminApi(`/api/v1/admin/products/${productId}/variations/${variationId}/translations`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteVariationTranslation(
  productId: number,
  variationId: number,
  language: string
): Promise<AdminProduct> {
  return fetchAdminApi(`/api/v1/admin/products/${productId}/variations/${variationId}/translations/${language}`, {
    method: "DELETE",
  });
}

// ============ Reorder API ============

export interface ReorderItem {
  id: number;
  order: number;
}

export async function reorderProducts(items: ReorderItem[]): Promise<{ data: AdminProduct[] }> {
  return fetchAdminApi("/api/v1/admin/products/reorder", {
    method: "PATCH",
    body: JSON.stringify({ items }),
  });
}

export async function reorderVariations(productId: number, items: ReorderItem[]): Promise<AdminProduct> {
  return fetchAdminApi(`/api/v1/admin/products/${productId}/variations/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ items }),
  });
}
