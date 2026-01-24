import { useQuery } from "@tanstack/react-query";
import { Product, ProductType } from "@/types/Product";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchApi } from "./api";
import { getTags } from "./tags";

interface ProductsResponse {
  data: Product[];
}

export interface GetProductsOptions {
  language?: string;
  search?: string;
  type?: ProductType;
  tagIds?: number[];
}

export async function getProducts(options: GetProductsOptions = {}): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (options.language) params.set("language", options.language);
  if (options.search) params.set("search", options.search);
  if (options.type) params.set("type", options.type);
  if (options.tagIds && options.tagIds.length > 0) {
    params.set("tag_ids", options.tagIds.join(","));
  }
  const queryString = params.toString();
  return fetchApi<ProductsResponse>(`/api/v1/products${queryString ? `?${queryString}` : ""}`);
}

export async function getProduct(id: number, language?: string): Promise<Product> {
  const params = language ? `?language=${language}` : "";
  return fetchApi<Product>(`/api/v1/products/${id}${params}`);
}

// React Query hooks

interface UseProductsOptions {
  search?: string;
  type?: ProductType;
  tagIds?: number[];
}

export function useProducts(options: UseProductsOptions = {}) {
  const language = useLanguage();
  const { search, type, tagIds } = options;

  return useQuery({
    queryKey: ["products", language, search, type, tagIds],
    queryFn: () => getProducts({ language, search, type, tagIds }),
  });
}

interface UseTagsOptions {
  type?: ProductType;
}

export function useTags(options: UseTagsOptions = {}) {
  const language = useLanguage();
  const { type } = options;

  return useQuery({
    queryKey: ["tags", language, type],
    queryFn: () => getTags({ language, type }),
  });
}
