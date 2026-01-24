import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Product, ProductVariation } from "@/types/Product";
import { Button } from "@/components/ui/button";
import { Minus, PartyPopper, Pencil, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart";
import { useAdmin } from "@/hooks/useAdmin";

interface ServiceCardProps {
  service: Product;
}

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function getDefaultVariation(service: Product): ProductVariation | null {
  if (service.variations && service.variations.length > 0) {
    return service.variations[0];
  }
  return null;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { cart, addItem, updateItem, isAddingItem } = useCart();
  const { isAdmin } = useAdmin({ skipVerification: true });
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(() =>
    getDefaultVariation(service)
  );

  const hasVariations = service.variations && service.variations.length > 0;

  // Show price of selected variation if it has one, otherwise service base price
  const displayPrice = selectedVariation?.price ?? service.price;
  const priceDisplay = formatCurrency(displayPrice);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const language = i18n.language;
    navigate(`/${language}/admin/services/${service.id}`, {
      state: { fromMarketplace: window.location.pathname },
    });
  };

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

  const handleVariationClick = (e: React.MouseEvent, variation: ProductVariation) => {
    e.stopPropagation();
    setSelectedVariation(variation);
  };

  return (
    <div className="group relative flex flex-col gap-6 lg:flex-row lg:gap-10 lg:min-h-90">
      {isAdmin && (
        <Button
          size="icon"
          className="absolute top-2 right-2 z-10 h-8 w-8 bg-action text-action-foreground hover:bg-action/90 opacity-70 hover:opacity-100"
          onClick={handleEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {/* Tall image on the left */}
      <div className="aspect-3/4 w-full overflow-hidden max-h-90 lg:w-52 lg:shrink-0 xl:w-56">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-100">
            <PartyPopper className="h-16 w-16 text-stone-300" />
          </div>
        )}
      </div>

      {/* Content on the right */}
      <div className="flex flex-1 flex-col py-2">
        <h3 className="text-xl font-semibold tracking-wide text-stone-800">
          {service.name}
        </h3>

        {service.description && (
          <div
            className="mt-6 text-sm tracking-wide text-stone-600 leading-relaxed prose prose-sm prose-stone max-w-none [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_li_p]:my-0 [&_li]:marker:text-stone-600 [&_span]:text-[length:inherit]"
            dangerouslySetInnerHTML={{ __html: service.description }}
          />
        )}

        {/* Bottom section: variations and price/action */}
        <div className="mt-auto pt-6">
          {/* Variation options */}
          {hasVariations && (
            <div className="mb-4 flex flex-wrap gap-2">
              {service.variations.map((variation) => (
                <Button
                  key={variation.id}
                  variant="outline"
                  size="sm"
                  className={`h-9 text-sm ${selectedVariation?.id === variation.id ? "border-2 border-primary shadow-md" : ""}`}
                  onClick={(e) => handleVariationClick(e, variation)}
                >
                  {variation.name}
                </Button>
              ))}
            </div>
          )}

          {/* Price and action */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-lg font-semibold text-stone-800">{priceDisplay}</p>

            {quantityInCart > 0 ? (
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 border-stone-300"
                  onClick={handleDecrement}
                  disabled={isAddingItem}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium">{quantityInCart}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 border-stone-300"
                  onClick={handleIncrement}
                  disabled={isAddingItem}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                className="h-10 bg-action text-action-foreground hover:bg-action/90"
                onClick={handleAddToCart}
                disabled={isAddingItem || (hasVariations && !selectedVariation)}
              >
                <ShoppingCart className="h-5 w-5" />
                Add
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
