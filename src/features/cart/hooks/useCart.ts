import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToCart,
  getCartToken,
  getOrCreateCart,
  removeFromCart,
  updateCartItem,
} from "@/services/cart";
import { Cart } from "@/types/Cart";
import { useLanguage } from "@/contexts/LanguageContext";

export function useCart() {
  const queryClient = useQueryClient();
  const language = useLanguage();

  const cartQuery = useQuery({
    queryKey: ["cart", language],
    queryFn: () => getOrCreateCart(language),
    enabled: !!getCartToken(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const addItemMutation = useMutation({
    mutationFn: ({
      productId,
      variationId = null,
      quantity = 1,
    }: {
      productId: number;
      variationId?: number | null;
      quantity?: number;
    }) => addToCart(productId, variationId, quantity, language),
    onSuccess: (cart) => {
      // Ensure cart data is properly typed and set
      queryClient.setQueryData<Cart>(["cart", language], cart);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      updateCartItem(itemId, quantity, language),
    onSuccess: (cart) => {
      queryClient.setQueryData<Cart>(["cart", language], cart);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", language] });
    },
  });

  const cart = cartQuery.data ?? addItemMutation.data;
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const resetCart = () => {
    queryClient.removeQueries({ queryKey: ["cart"] });
  };

  return {
    cart,
    isLoading: cartQuery.isLoading,
    itemCount,
    addItem: addItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    isAddingItem: addItemMutation.isPending,
    resetCart,
  };
}
