export interface CartItem {
  productId: number;
  productName: string;
  unitPrice: string;
  quantity: number;
  subtotal: string;
}

export interface Cart {
  token: string;
  items: CartItem[];
  total: string;
}
