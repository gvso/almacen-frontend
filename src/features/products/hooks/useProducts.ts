import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/products";
import { useLanguage } from "@/contexts/LanguageContext";

export function useProducts() {
  const language = useLanguage();
  
  return useQuery({
    queryKey: ["products", language],
    queryFn: () => getProducts(language),
  });
}
