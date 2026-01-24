export interface TipTranslation {
  language: string;
  title: string;
  description: string;
}

export interface Tip {
  id: number;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  insertedAt: string;
  updatedAt: string;
}

export interface AdminTip extends Tip {
  translations: TipTranslation[];
}

// Request types
export interface TipCreateData {
  title: string;
  description: string;
  order?: number;
  is_active?: boolean;
}

export interface TipUpdateData {
  title?: string;
  description?: string;
  order?: number;
  is_active?: boolean;
}

export interface TipTranslationData {
  language: string;
  title: string;
  description: string;
}
