import type { Tag } from "@/types/Tag";
import type { ProductType } from "@/types/Product";
import { fetchApi } from "./api";

interface TagsResponse {
    data: Tag[];
}

export interface GetTagsOptions {
    language?: string;
    type?: ProductType;
}

export async function getTags(options: GetTagsOptions = {}): Promise<TagsResponse> {
    const params = new URLSearchParams();
    if (options.language) params.set("language", options.language);
    if (options.type) params.set("type", options.type);
    const queryString = params.toString();
    return fetchApi<TagsResponse>(`/api/v1/tags${queryString ? `?${queryString}` : ""}`);
}
