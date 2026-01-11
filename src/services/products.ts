import { Product } from "@/types/Product";
import { fetchApi } from "./api";

interface ProductsResponse {
  data: Product[];
}

export async function getProducts(language?: string, search?: string): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (language) params.set("language", language);
  if (search) params.set("search", search);
  const queryString = params.toString();
  return fetchApi<ProductsResponse>(`/api/v1/products${queryString ? `?${queryString}` : ""}`);
}

export async function getProduct(id: number, language?: string): Promise<Product> {
  const params = language ? `?language=${language}` : "";
  return fetchApi<Product>(`/api/v1/products/${id}${params}`);
}
