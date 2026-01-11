import { Product, ProductType } from "@/types/Product";
import { fetchApi } from "./api";

interface ProductsResponse {
  data: Product[];
}

export interface GetProductsOptions {
  language?: string;
  search?: string;
  type?: ProductType;
}

export async function getProducts(options: GetProductsOptions = {}): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (options.language) params.set("language", options.language);
  if (options.search) params.set("search", options.search);
  if (options.type) params.set("type", options.type);
  const queryString = params.toString();
  return fetchApi<ProductsResponse>(`/api/v1/products${queryString ? `?${queryString}` : ""}`);
}

export async function getProduct(id: number, language?: string): Promise<Product> {
  const params = language ? `?language=${language}` : "";
  return fetchApi<Product>(`/api/v1/products/${id}${params}`);
}
