import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Product, ProductVariation } from "@/types/Product";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Package, Pencil, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/services/cart";
import { useAdmin } from "@/hooks/useAdmin";

interface ProductCardProps {
  product: Product;
}

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function getDefaultVariation(product: Product): ProductVariation | null {
  if (product.variations && product.variations.length > 0) {
    return product.variations[0];
  }
  return null;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cart, addItem, updateItem, isAddingItem } = useCart();
  const { isAdmin } = useAdmin({ skipVerification: true });
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(() =>
    getDefaultVariation(product)
  );

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const language = i18n.language;
    navigate(`/${language}/admin/products/${product.id}`, {
      state: { fromMarketplace: window.location.pathname },
    });
  };

  const hasVariations = product.variations && product.variations.length > 0;

  // Show price of selected variation if it has one, otherwise product base price
  const displayPrice = selectedVariation?.price ?? product.price;
  const priceDisplay = formatCurrency(displayPrice);

  // Find cart item matching product and selected variation
  const cartItem = cart?.items?.find(
    (item) =>
      item.productId === product.id &&
      item.variationId === (selectedVariation?.id ?? null)
  );
  const quantityInCart = cartItem?.quantity ?? 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ productId: product.id, variationId: selectedVariation?.id ?? null });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ productId: product.id, variationId: selectedVariation?.id ?? null });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem && quantityInCart > 0) {
      updateItem({ itemId: cartItem.id, quantity: quantityInCart - 1 });
    }
  };

  const handleVariationClick = (e: React.MouseEvent, variation: ProductVariation | null) => {
    e.stopPropagation();
    setSelectedVariation(variation);
  };

  // Display image: variation image if selected and has one, otherwise product image
  const displayImage = selectedVariation?.imageUrl ?? product.imageUrl;

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
      {isAdmin && (
        <Button
          size="icon"
          className="absolute top-2 left-2 z-10 h-8 w-8 bg-action text-action-foreground hover:bg-action/90 opacity-70 hover:opacity-100"
          onClick={handleEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      <div className="aspect-3/2 overflow-hidden bg-muted">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="h-full w-full object-contain p-2 transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col p-4">
        <h3 className="font-medium text-foreground line-clamp-2">{product.name}</h3>
        {product.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Bottom section: variations first, then price/button always at bottom */}
        <div className="mt-auto pt-3">
          {/* Variation options */}
          {hasVariations && (
            <div className="mb-3 flex flex-wrap gap-2">
              {product.variations.map((variation) => (
                <Button
                  key={variation.id}
                  variant="outline"
                  size="sm"
                  className={`h-10 text-sm sm:h-7 sm:text-xs ${selectedVariation?.id === variation.id ? "border-3 border-primary shadow-md" : ""}`}
                  onClick={(e) => handleVariationClick(e, variation)}
                >
                  {variation.name}
                </Button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <p className="text-lg font-semibold text-black">{priceDisplay}</p>
            {quantityInCart > 0 ? (
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9"
                  onClick={handleDecrement}
                  disabled={isAddingItem}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantityInCart}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9"
                  onClick={handleIncrement}
                  disabled={isAddingItem}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                className="h-9 bg-action text-action-foreground hover:bg-action/90"
                onClick={handleAddToCart}
                disabled={isAddingItem || (hasVariations && !selectedVariation)}
              >
                <ShoppingCart className="h-4 w-4" />
                Add
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
