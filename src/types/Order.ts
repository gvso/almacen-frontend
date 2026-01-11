export interface OrderItem {
  productId: number;
  productName: string;
  imageUrl: string | null;
  variationId: number | null;
  variationName: string | null;
  unitPrice: string;
  quantity: number;
  subtotal: string;
}

export interface Order {
  id: string;
  status: "confirmed" | "processed" | "cancelled";
  total: string;
  notes: string | null;
  items: OrderItem[];
  insertedAt: string | null;
}
