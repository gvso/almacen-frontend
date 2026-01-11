import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/products";
import { useLanguage } from "@/contexts/LanguageContext";

interface UseProductsOptions {
  search?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const language = useLanguage();
  const { search } = options;
  
  return useQuery({
    queryKey: ["products", language, search],
    queryFn: () => getProducts(language, search),
  });
}
