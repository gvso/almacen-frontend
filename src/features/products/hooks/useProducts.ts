import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/products";
import { getTags } from "@/services/tags";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ProductType } from "@/types/Product";

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
