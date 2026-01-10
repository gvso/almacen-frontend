import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Package } from "lucide-react";
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
  const { cart, isLoading, itemCount, resetCart } = useCart();
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
          <p className="text-muted-foreground">{t("cart.empty")}</p>
        )}

        {!isLoading && cart?.items && cart.items.length > 0 && (
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.productImageUrl ? (
                    <img
                      src={item.productImageUrl}
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
                  <p className="text-sm text-muted-foreground">
                    {t("cart.quantity")}: {item.quantity}
                  </p>
                </div>
                <p className="font-bold">${formatPrice(item.subtotal)}</p>
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
