export interface CartItem {
  productId: number;
  productName: string;
  productImageUrl: string | null;
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
