import { Product } from "@/types/Product";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Package, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cart, addItem, updateItem, isAddingItem } = useCart();

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(product.price));

  const cartItem = cart?.items?.find((item) => item.productId === product.id);
  const quantityInCart = cartItem?.quantity ?? 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ productId: product.id });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ productId: product.id });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantityInCart > 0) {
      updateItem({ productId: product.id, quantity: quantityInCart - 1 });
    }
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-3/2 overflow-hidden bg-muted sm:aspect-square">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-2 transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-foreground line-clamp-2">{product.name}</h3>
        {product.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-semibold text-primary">{formattedPrice}</p>
          {quantityInCart > 0 ? (
            <div className="flex w-full items-center justify-center gap-1 sm:w-auto">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={handleDecrement}
                disabled={isAddingItem}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantityInCart}</span>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={handleIncrement}
                disabled={isAddingItem}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              className="h-10 w-full sm:h-9 sm:w-auto"
              onClick={handleAddToCart}
              disabled={isAddingItem}
            >
              <ShoppingCart className="h-5 w-5" />
              Add
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
