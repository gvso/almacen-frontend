export interface TagTranslation {
    language: string;
    label: string;
}

export interface Tag {
    id: number;
    label: string;
    order: number;
    insertedAt: string;
    updatedAt: string;
}

export interface AdminTag extends Tag {
    translations: TagTranslation[];
}

// Request types
export interface TagCreateData {
    label: string;
}

export interface TagUpdateData {
    label?: string;
}

export interface TagTranslationData {
    language: string;
    label: string;
}

export interface EntityTagAddData {
    tag_id: number;
}
