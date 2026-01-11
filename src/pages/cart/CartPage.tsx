import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Minus, Package, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { OrderSuccessDialog } from "@/features/orders";
import { useCart } from "@/features/cart";
import { checkout } from "@/services/orders";
import { clearCartToken } from "@/services/cart";
import { useLanguage } from "@/contexts/LanguageContext";

function formatPrice(value: string | number): string {
  return Number(value).toFixed(2);
}

export default function CartPage() {
  const { cart, isLoading, itemCount, resetCart, updateItem, removeItem } = useCart();
  const language = useLanguage();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderUrl, setOrderUrl] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!cart?.token) return;

    setIsCheckingOut(true);
    try {
      const order = await checkout(cart.token, { language });
      const url = `${window.location.origin}/${language}/orders/${order.id}`;
      setOrderUrl(url);
    } catch (error) {
      console.error("Checkout failed:", error);
      setIsCheckingOut(false);
    }
  };

  const handleCloseDialog = () => {
    clearCartToken();
    resetCart();
    setOrderUrl(null);
    setIsCheckingOut(false);
    navigate(`/${language}/products`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <PageTitle>{t("cart.title")}</PageTitle>

        {isLoading && <p>{t("cart.loading")}</p>}

        {!isLoading && itemCount === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-6 mb-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t("cart.empty")}</h2>
            <p className="text-muted-foreground mb-6">{t("cart.emptyDescription")}</p>
            <Button onClick={() => navigate(`/${language}/products`)}>
              {t("cart.browseProducts")}
            </Button>
          </div>
        )}

        {!isLoading && cart?.items && cart.items.length > 0 && (
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  {item.variationName && (
                    <p className="text-sm text-muted-foreground">{item.variationName}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateItem({ itemId: item.id, quantity: item.quantity - 1 })}
                      disabled={item.quantity <= 1}
                      aria-label={t("cart.decrease")}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateItem({ itemId: item.id, quantity: item.quantity + 1 })}
                      aria-label={t("cart.increase")}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-bold">${formatPrice(item.subtotal)}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                    aria-label={t("cart.remove")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex flex-col gap-4">
                <p className="text-xl font-bold text-right">{t("common.total")}: ${formatPrice(cart.total)}</p>
                <Button
                  size="lg"
                  className="w-full mt-8 sm:w-auto sm:ml-auto"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? t("cart.processing") : t("cart.checkout")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <OrderSuccessDialog orderUrl={orderUrl} onClose={handleCloseDialog} />
    </div>
  );
}
