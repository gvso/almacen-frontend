import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/products";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ProductType } from "@/types/Product";

interface UseProductsOptions {
  search?: string;
  type?: ProductType;
}

export function useProducts(options: UseProductsOptions = {}) {
  const language = useLanguage();
  const { search, type } = options;
  
  return useQuery({
    queryKey: ["products", language, search, type],
    queryFn: () => getProducts({ language, search, type }),
  });
}
