export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  variationId: number | null;
  variationName: string | null;
  imageUrl: string | null;
  unitPrice: string;
  quantity: number;
  subtotal: string;
}

export interface Cart {
  token: string;
  items: CartItem[];
  total: string;
}

export interface SuccessResponse {
  status: "success";
}
