import { useState } from "react";
import { Product, ProductVariation } from "@/types/Product";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Wrench, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart";

interface ServiceCardProps {
  service: Product;
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

export function ServiceCard({ service }: ServiceCardProps) {
  const { cart, addItem, updateItem, isAddingItem } = useCart();
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(() =>
    getDefaultVariation(service)
  );

  const hasVariations = service.variations && service.variations.length > 0;

  // Show price of selected variation if it has one, otherwise service base price
  const displayPrice = selectedVariation?.price ?? service.price;
  const priceDisplay = formatCurrency(displayPrice);

  // Find cart item matching service and selected variation
  const cartItem = cart?.items?.find(
    (item) =>
      item.productId === service.id &&
      item.variationId === (selectedVariation?.id ?? null)
  );
  const quantityInCart = cartItem?.quantity ?? 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ productId: service.id, variationId: selectedVariation?.id ?? null });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ productId: service.id, variationId: selectedVariation?.id ?? null });
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

  // Display image: variation image if selected and has one, otherwise service image
  const displayImage = selectedVariation?.imageUrl ?? service.imageUrl;

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all hover:shadow-lg md:flex-row">
      {/* Image on the left */}
      <div className="aspect-video w-full overflow-hidden bg-muted md:aspect-square md:w-64 md:shrink-0">
        {displayImage ? (
          <img
            src={displayImage}
            alt={service.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Wrench className="h-20 w-20 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content on the right */}
      <CardContent className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-semibold text-foreground">{service.name}</h3>
        {service.description && (
          <p className="mt-2 text-base text-muted-foreground leading-relaxed">
            {service.description}
          </p>
        )}

        {/* Bottom section: variations first, then price/button always at bottom */}
        <div className="mt-auto pt-4">
          {/* Variation options */}
          {hasVariations && (
            <div className="mb-4 flex flex-wrap gap-2">
              {service.variations.map((variation) => (
                <Button
                  key={variation.id}
                  variant="outline"
                  size="sm"
                  className={`h-10 text-sm ${selectedVariation?.id === variation.id ? "border-3 border-primary shadow-md" : ""}`}
                  onClick={(e) => handleVariationClick(e, variation)}
                >
                  {variation.name}
                </Button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-2xl font-bold text-black">{priceDisplay}</p>
            {quantityInCart > 0 ? (
              <div className="flex w-full items-center justify-center gap-2 sm:w-auto">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-10 w-10"
                  onClick={handleDecrement}
                  disabled={isAddingItem}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span className="w-10 text-center text-lg font-medium">{quantityInCart}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-10 w-10"
                  onClick={handleIncrement}
                  disabled={isAddingItem}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button
                className="h-12 w-full text-base sm:h-11 sm:w-auto sm:px-6 bg-tertiary text-tertiary-foreground hover:bg-tertiary/90"
                onClick={handleAddToCart}
                disabled={isAddingItem || (hasVariations && !selectedVariation)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
