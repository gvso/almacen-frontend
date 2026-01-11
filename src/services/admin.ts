import { API_BASE_URL } from "@/contants";
import { toCamelCase } from "@/utils/casing";

const ADMIN_TOKEN_KEY = "admin_token";

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function adminLogin(password: string): Promise<{ token: string }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || "Login failed");
  }

  return response.json();
}

export async function verifyAdminToken(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchAdminApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAdminToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAdminToken();
      // Redirect to admin login, preserving language from current path
      const lang = window.location.pathname.split("/")[1] || "en";
      window.location.href = `/${lang}/admin`;
    }
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return toCamelCase(data) as T;
}

// ============ Product API ============

import type { AdminProduct, ProductUpdateData, TranslationData, VariationCreateData, VariationUpdateData, VariationTranslationData } from "@/types/AdminProduct";

export async function fetchAdminProducts(): Promise<{ data: AdminProduct[] }> {
  return fetchAdminApi("/api/v1/admin/products");
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

export async function updateVariation(productId: number, variationId: number, data: VariationUpdateData): Promise<AdminProduct> {
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
