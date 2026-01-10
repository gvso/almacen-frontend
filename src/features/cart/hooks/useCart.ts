import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToCart,
  getCartToken,
  getOrCreateCart,
  removeFromCart,
  updateCartItem,
} from "@/services/cart";
import { Cart } from "@/types/Cart";

export function useCart() {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: getOrCreateCart,
    enabled: !!getCartToken(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const addItemMutation = useMutation({
    mutationFn: ({ productId, quantity = 1 }: { productId: number; quantity?: number }) =>
      addToCart(productId, quantity),
    onSuccess: (cart) => {
      // Ensure cart data is properly typed and set
      queryClient.setQueryData<Cart>(["cart"], cart);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      updateCartItem(productId, quantity),
    onSuccess: (cart) => {
      queryClient.setQueryData<Cart>(["cart"], cart);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (productId: number) => removeFromCart(productId),
    onSuccess: (cart) => {
      queryClient.setQueryData<Cart>(["cart"], cart);
    },
  });

  const cart = cartQuery.data ?? addItemMutation.data;
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return {
    cart,
    isLoading: cartQuery.isLoading,
    itemCount,
    addItem: addItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    isAddingItem: addItemMutation.isPending,
  };
}
