import type { AdminTag, Tag } from "./Tag";

export type TipType = "quick_tip" | "business";

export interface TipTranslation {
  language: string;
  title: string;
  description: string;
}

export interface Tip {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  order: number;
  isActive: boolean;
  tipType: TipType;
  tags: Tag[];
  insertedAt: string;
  updatedAt: string;
}

export interface AdminTip extends Omit<Tip, "tags"> {
  translations: TipTranslation[];
  tags: AdminTag[];
}

// Request types
export interface TipCreateData {
  title: string;
  description: string;
  image_url?: string | null;
  order?: number;
  is_active?: boolean;
  tip_type?: TipType;
}

export interface TipUpdateData {
  title?: string;
  description?: string;
  image_url?: string | null;
  order?: number;
  is_active?: boolean;
  tip_type?: TipType;
}

export interface TipTranslationData {
  language: string;
  title: string;
  description: string;
}
