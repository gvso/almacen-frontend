import { Order } from "@/types/Order";
import { fetchApi } from "./api";
import { toCamelCase } from "@/utils/casing";

/** Raw API response types (snake_case from backend) */
interface ApiOrderItem {
  product_id: number;
  product_name: string;
  image_url: string | null;
  variation_id: number | null;
  variation_name: string | null;
  unit_price: string;
  quantity: number;
  subtotal: string;
}

interface ApiOrder {
  id: string;
  status: "pending" | "confirmed" | "cancelled";
  total: string;
  notes: string | null;
  items: ApiOrderItem[];
  inserted_at: string | null;
}

interface CheckoutRequest {
  cart_token: string;
  contact_info?: string;
  notes?: string;
}

export async function checkout(
  cartToken: string,
  options?: { contactInfo?: string; notes?: string; language?: string }
): Promise<Order> {
  const params = options?.language ? `?language=${options.language}` : "";
  const body: CheckoutRequest = {
    cart_token: cartToken,
    contact_info: options?.contactInfo,
    notes: options?.notes,
  };

  const response = await fetchApi<ApiOrder>(`/api/v1/orders${params}`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  return toCamelCase(response) as Order;
}

export async function getOrder(orderId: string, language?: string): Promise<Order> {
  const params = language ? `?language=${language}` : "";
  const response = await fetchApi<ApiOrder>(`/api/v1/orders/${orderId}${params}`);
  return toCamelCase(response) as Order;
}
