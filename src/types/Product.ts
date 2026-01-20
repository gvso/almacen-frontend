import type { Tag } from "./Tag";

export type ProductType = "product" | "service" | "housekeeping";

export interface ProductVariation {
  id: number;
  name: string;
  price: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isActive: boolean;
  type: ProductType;
  createdAt: string;
  updatedAt: string;
  variations: ProductVariation[];
  tags: Tag[];
}
