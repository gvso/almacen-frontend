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
