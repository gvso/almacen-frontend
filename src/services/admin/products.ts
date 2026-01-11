import type {
  AdminProduct,
  ProductCreateData,
  ProductUpdateData,
  TranslationData,
  VariationCreateData,
  VariationUpdateData,
  VariationTranslationData,
} from "@/types/AdminProduct";
import { fetchAdminApi } from "./api";

// ============ Product API ============

export async function fetchAdminProducts(): Promise<{ data: AdminProduct[] }> {
  return fetchAdminApi("/api/v1/admin/products");
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
