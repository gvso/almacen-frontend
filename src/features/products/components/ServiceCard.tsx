import { Product } from "@/types/Product";
import { Button } from "@/components/ui/button";
import { Minus, PartyPopper, Plus, ShoppingCart } from "lucide-react";
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

export function ServiceCard({ service }: ServiceCardProps) {
  const { cart, addItem, updateItem, isAddingItem } = useCart();

  const priceDisplay = formatCurrency(service.price);

  // Find cart item matching service (no variations for services)
  const cartItem = cart?.items?.find(
    (item) => item.productId === service.id && item.variationId === null
  );
  const quantityInCart = cartItem?.quantity ?? 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ productId: service.id, variationId: null });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ productId: service.id, variationId: null });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem && quantityInCart > 0) {
      updateItem({ itemId: cartItem.id, quantity: quantityInCart - 1 });
    }
  };

  return (
    <div className="group flex flex-col gap-6 md:flex-row md:gap-10 md:min-h-110">
      {/* Tall image on the left */}
      <div className="aspect-3/4 w-full overflow-hidden md:w-52 md:shrink-0 lg:w-56">
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

        {/* Price and action */}
        <div className="mt-auto pt-8 flex items-center justify-between gap-4">
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
              disabled={isAddingItem}
            >
              <ShoppingCart className="h-5 w-5" />
              Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
