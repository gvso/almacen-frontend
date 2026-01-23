import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Product } from "@/types/Product";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Pencil, Sparkles, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart";
import { useAdmin } from "@/hooks/useAdmin";

interface HousekeepingCardProps {
  service: Product;
}

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

export function HousekeepingCard({ service }: HousekeepingCardProps) {
  const { cart, addItem, updateItem, isAddingItem } = useCart();
  const { isAdmin } = useAdmin({ skipVerification: true });
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const priceDisplay = formatCurrency(service.price);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const language = i18n.language;
    navigate(`/${language}/admin/housekeeping/${service.id}`, {
      state: { fromMarketplace: window.location.pathname },
    });
  };

  // Find cart item matching service (no variations for housekeeping)
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
    <Card className="group relative flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
      {isAdmin && (
        <Button
          size="icon"
          className="absolute top-2 right-2 z-10 h-8 w-8 bg-action text-action-foreground hover:bg-action/90 opacity-70 hover:opacity-100"
          onClick={handleEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {/* Image at the top */}
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Sparkles className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content at the bottom */}
      <CardContent className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
        {service.description && (
          <div
            className="mt-2 text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_li_p]:my-0 [&_li]:marker:text-current [&_span]:text-[length:inherit]"
            dangerouslySetInnerHTML={{ __html: service.description }}
          />
        )}

        {/* Bottom section: price/button */}
        <div className="mt-auto pt-4">
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
                disabled={isAddingItem}
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
