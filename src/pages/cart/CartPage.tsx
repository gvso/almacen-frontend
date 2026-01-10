import { Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/features/cart";

function formatPrice(value: string | number): string {
  return Number(value).toFixed(2);
}

export default function CartPage() {
  const { cart, isLoading, itemCount } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Shopping Cart</h1>

        {isLoading && <p>Loading cart...</p>}

        {!isLoading && itemCount === 0 && (
          <p className="text-muted-foreground">Your cart is empty.</p>
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
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-bold">${formatPrice(item.subtotal)}</p>
              </div>
            ))}
            <div className="border-t pt-4 text-right">
              <p className="text-xl font-bold">Total: ${formatPrice(cart.total)}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
