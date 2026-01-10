import { Product } from "@/types/Product";
import { fetchApi } from "./api";

interface ProductsResponse {
  data: Product[];
}

export async function getProducts(): Promise<ProductsResponse> {
  return fetchApi<ProductsResponse>("/api/v1/products");
}

export async function getProduct(id: number): Promise<Product> {
  return fetchApi<Product>(`/api/v1/products/${id}`);
}
