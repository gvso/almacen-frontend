export type TagCategory = "product" | "tip";

export interface TagTranslation {
    language: string;
    label: string;
}

export interface Tag {
    id: number;
    label: string;
    key: string;  // Original/base label for URL matching (language-independent)
    category: TagCategory;
    order: number;
    isFilterable: boolean;
    bgColor: string;
    textColor: string;
    insertedAt: string;
    updatedAt: string;
}

export interface AdminTag extends Tag {
    translations: TagTranslation[];
}

// Request types
export interface TagCreateData {
    label: string;
    category?: TagCategory;
    isFilterable?: boolean;
    bgColor?: string;
    textColor?: string;
}

export interface TagUpdateData {
    label?: string;
    category?: TagCategory;
    isFilterable?: boolean;
    bgColor?: string;
    textColor?: string;
}

export interface TagTranslationData {
    language: string;
    label: string;
}

export interface EntityTagAddData {
    tag_id: number;
}
