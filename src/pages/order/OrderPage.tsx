import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, CheckCircle, Clock, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import { ErrorAlert } from "@/components/Alert";
import { getOrder } from "@/services/orders";
import { useLanguage } from "@/contexts/LanguageContext";

function formatPrice(value: string | number): string {
  return Number(value).toFixed(2);
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "text-yellow-600 bg-yellow-50",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    className: "text-green-600 bg-green-50",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "text-red-600 bg-red-50",
  },
};

export default function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const language = useLanguage();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", orderId, language],
    queryFn: () => getOrder(orderId!, language),
    enabled: !!orderId,
  });

  const status = order ? statusConfig[order.status] : null;
  const StatusIcon = status?.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Order Details</h1>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {isError && (
          <ErrorAlert message="Failed to load order. Please check the order ID and try again." />
        )}

        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="rounded-lg border p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-lg font-medium">{order.id}</p>
                </div>
                {status && StatusIcon && (
                  <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${status.className}`}>
                    <StatusIcon className="h-5 w-5" />
                    <span className="font-medium">{status.label}</span>
                  </div>
                )}
              </div>
              {order.insertedAt && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Placed on {new Date(order.insertedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Items</h2>
              {order.items.map((item) => (
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
                      ${formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold">${formatPrice(item.subtotal)}</p>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="border-t pt-4 text-right">
              <p className="text-xl font-bold">Total: ${formatPrice(order.total)}</p>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="rounded-lg border p-4">
                <h2 className="mb-2 font-semibold">Notes</h2>
                <p className="text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
