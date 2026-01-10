export interface OrderItem {
  productId: number;
  productName: string;
  productImageUrl: string | null;
  unitPrice: string;
  quantity: number;
  subtotal: string;
}

export interface Order {
  id: string;
  status: "pending" | "confirmed" | "cancelled";
  total: string;
  notes: string | null;
  items: OrderItem[];
  insertedAt: string | null;
}
