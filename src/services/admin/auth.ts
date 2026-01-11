import { API_BASE_URL } from "@/contants";
import { getAdminToken } from "./api";

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
