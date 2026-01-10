import { Product } from "@/types/Product";
import { fetchApi } from "./api";

interface ProductsResponse {
  data: Product[];
}

export async function getProducts(language?: string): Promise<ProductsResponse> {
  const params = language ? `?language=${language}` : "";
  return fetchApi<ProductsResponse>(`/api/v1/products${params}`);
}

export async function getProduct(id: number, language?: string): Promise<Product> {
  const params = language ? `?language=${language}` : "";
  return fetchApi<Product>(`/api/v1/products/${id}${params}`);
}
