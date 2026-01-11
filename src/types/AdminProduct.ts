export type ProductType = "product" | "service";

export interface ProductTranslation {
  language: string;
  name: string;
  description: string | null;
}

export interface VariationTranslation {
  language: string;
  name: string;
}

export interface AdminVariation {
  id: number;
  productId: number;
  name: string;
  price: string | null;
  imageUrl: string | null;
  order: number;
  isActive: boolean;
  insertedAt: string;
  updatedAt: string;
  translations: VariationTranslation[];
}

export interface AdminProduct {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  order: number;
  isActive: boolean;
  type: ProductType;
  insertedAt: string;
  updatedAt: string;
  translations: ProductTranslation[];
  variations: AdminVariation[];
}

// Request types
export interface ProductCreateData {
  name: string;
  description?: string | null;
  price: string;
  image_url?: string | null;
  order?: number;
  is_active?: boolean;
  type?: ProductType;
}

export interface ProductUpdateData {
  name?: string;
  description?: string | null;
  price?: string;
  image_url?: string | null;
  order?: number;
  is_active?: boolean;
  type?: ProductType;
}

export interface TranslationData {
  language: string;
  name: string;
  description?: string | null;
}

export interface VariationCreateData {
  name: string;
  price?: string | null;
  image_url?: string | null;
  order?: number;
  is_active?: boolean;
}

export interface VariationUpdateData {
  name?: string;
  price?: string | null;
  image_url?: string | null;
  order?: number;
  is_active?: boolean;
}

export interface VariationTranslationData {
  language: string;
  name: string;
}
