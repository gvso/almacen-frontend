import { Cart, SuccessResponse } from "@/types/Cart";
import { fetchApi } from "./api";
import { toCamelCase } from "@/utils/casing";

/** Raw API response types (snake_case from backend) */
interface ApiCartItem {
  id: number;
  product_id: number;
  product_name: string;
  variation_id: number | null;
  variation_name: string | null;
  image_url: string | null;
  unit_price: string;
  quantity: number;
  subtotal: string;
}

interface ApiCart {
  token: string;
  items: ApiCartItem[];
  total: string;
}

const CART_TOKEN_KEY = "cart_token";

export function getCartToken(): string | null {
  return localStorage.getItem(CART_TOKEN_KEY);
}

export function setCartToken(token: string): void {
  localStorage.setItem(CART_TOKEN_KEY, token);
}

export function clearCartToken(): void {
  localStorage.removeItem(CART_TOKEN_KEY);
}

export async function createCart(language?: string): Promise<Cart> {
  const params = language ? `?language=${language}` : "";
  const response = await fetchApi<ApiCart>(`/api/v1/cart${params}`, { method: "POST" });
  const cart = toCamelCase(response) as Cart;
  if (!cart.token) {
    throw new Error("Failed to create cart: no token returned");
  }
  setCartToken(cart.token);
  return cart;
}

export async function getCart(token: string, language?: string): Promise<Cart> {
  const params = language ? `?language=${language}` : "";
  const response = await fetchApi<ApiCart>(`/api/v1/cart/${token}${params}`);
  return toCamelCase(response) as Cart;
}

export async function getOrCreateCart(language?: string): Promise<Cart> {
  const token = getCartToken();
  if (token) {
    try {
      return await getCart(token, language);
    } catch {
      // Cart not found, create a new one
      clearCartToken();
    }
  }
  return createCart(language);
}

export async function addToCart(
  productId: number,
  variationId: number | null = null,
  quantity: number = 1,
  language?: string
): Promise<Cart> {
  // Always ensure we have a valid cart first
  const existingToken = getCartToken();
  let token: string;

  if (existingToken) {
    token = existingToken;
  } else {
    const newCart = await createCart(language);
    token = newCart.token;
  }

  const params = language ? `?language=${language}` : "";
  const response = await fetchApi<ApiCart>(`/api/v1/cart/${token}/items${params}`, {
    method: "POST",
    body: JSON.stringify({ product_id: productId, variation_id: variationId, quantity }),
  });

  return toCamelCase(response) as Cart;
}

export async function updateCartItem(itemId: number, quantity: number, language?: string): Promise<Cart> {
  const token = getCartToken();
  if (!token) {
    throw new Error("No cart found");
  }

  const params = language ? `?language=${language}` : "";
  const response = await fetchApi<ApiCart>(`/api/v1/cart/${token}/items/${itemId}${params}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });

  return toCamelCase(response) as Cart;
}

export async function removeFromCart(itemId: number): Promise<SuccessResponse> {
  const token = getCartToken();
  if (!token) {
    throw new Error("No cart found");
  }

  return fetchApi<SuccessResponse>(`/api/v1/cart/${token}/items/${itemId}`, {
    method: "DELETE",
  });
}
