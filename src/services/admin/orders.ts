import { fetchAdminApi } from "./api";
import type { Order } from "@/types/Order";

interface OrdersResponse {
  data: Order[];
}

export async function fetchAdminOrders(): Promise<OrdersResponse> {
  return fetchAdminApi<OrdersResponse>("/api/v1/admin/orders");
}

export async function updateOrderStatus(
  orderId: string,
  status: "confirmed" | "processed" | "cancelled"
): Promise<Order> {
  return fetchAdminApi<Order>(`/api/v1/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateOrderLabel(
  orderId: string,
  label: string
): Promise<Order> {
  return fetchAdminApi<Order>(`/api/v1/admin/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ label }),
  });
}
