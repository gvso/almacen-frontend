import { Cart } from "@/types/Cart";
import { fetchApi } from "./api";

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

export async function createCart(): Promise<Cart> {
  const cart = await fetchApi<Cart>("/api/v1/cart", { method: "POST" });
  if (!cart.token) {
    throw new Error("Failed to create cart: no token returned");
  }
  setCartToken(cart.token);
  return cart;
}

export async function getCart(token: string): Promise<Cart> {
  return fetchApi<Cart>(`/api/v1/cart/${token}`);
}

export async function getOrCreateCart(): Promise<Cart> {
  const token = getCartToken();
  if (token) {
    try {
      return await getCart(token);
    } catch {
      // Cart not found, create a new one
      clearCartToken();
    }
  }
  return createCart();
}

export async function addToCart(productId: number, quantity: number = 1): Promise<Cart> {
  // Always ensure we have a valid cart first
  const existingToken = getCartToken();
  let token: string;

  if (existingToken) {
    token = existingToken;
  } else {
    const newCart = await createCart();
    token = newCart.token;
  }

  const cart = await fetchApi<Cart>(`/api/v1/cart/${token}/items`, {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity }),
  });

  return cart;
}

export async function updateCartItem(productId: number, quantity: number): Promise<Cart> {
  const token = getCartToken();
  if (!token) {
    throw new Error("No cart found");
  }

  return fetchApi<Cart>(`/api/v1/cart/${token}/items/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCart(productId: number): Promise<Cart> {
  const token = getCartToken();
  if (!token) {
    throw new Error("No cart found");
  }

  return fetchApi<Cart>(`/api/v1/cart/${token}/items/${productId}`, {
    method: "DELETE",
  });
}
