import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Package, CheckCircle, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTitle from "@/components/PageTitle";
import Spinner from "@/components/Spinner";
import { ErrorAlert } from "@/components/Alert";
import { getOrder } from "@/services/orders";
import { useLanguage } from "@/contexts/LanguageContext";

function formatPrice(value: string | number): string {
  return Number(value).toFixed(2);
}

const statusIcons = {
  confirmed: CheckCircle,
  processed: CheckCircle,
  cancelled: XCircle,
};

const statusStyles = {
  confirmed: "text-yellow-600 bg-yellow-50",
  processed: "text-green-600 bg-green-50",
  cancelled: "text-red-600 bg-red-50",
};

export default function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const language = useLanguage();
  const { t } = useTranslation();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", orderId, language],
    queryFn: () => getOrder(orderId!, language),
    enabled: !!orderId,
  });

  const StatusIcon = order ? statusIcons[order.status] : null;
  const statusStyle = order ? statusStyles[order.status] : null;
  const statusLabel = order ? t(`order.status.${order.status}`) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <PageTitle>{t("order.title")}</PageTitle>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {isError && (
          <ErrorAlert message={t("order.loadError")} />
        )}

        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="rounded-lg border p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("order.orderId")}</p>
                  <p className="font-mono text-lg font-medium">{order.id}</p>
                </div>
                {statusStyle && StatusIcon && (
                  <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${statusStyle}`}>
                    <StatusIcon className="h-5 w-5" />
                    <span className="font-medium">{statusLabel}</span>
                  </div>
                )}
              </div>
              {order.insertedAt && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {t("order.placedOn", { date: new Date(order.insertedAt).toLocaleDateString() })}
                </p>
              )}
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{t("order.items")}</h2>
              {order.items.map((item, index) => (
                <div
                  key={`${item.productId}-${item.variationId ?? index}`}
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
              <p className="text-xl font-bold">{t("common.total")}: ${formatPrice(order.total)}</p>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="rounded-lg border p-4">
                <h2 className="mb-2 font-semibold">{t("order.notes")}</h2>
                <p className="text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
