import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Pencil,
  Check,
  X,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  fetchAdminOrders,
  verifyAdminToken,
  updateOrderLabel,
  updateOrderStatus,
} from "@/services/admin";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Order } from "@/types/Order";

function formatPrice(value: string | number): string {
  return Number(value).toFixed(2);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusConfig = {
  confirmed: {
    icon: Clock,
    label: "Confirmed",
    className: "text-yellow-600 bg-yellow-100",
  },
  processed: {
    icon: CheckCircle,
    label: "Processed",
    className: "text-green-600 bg-green-100",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    className: "text-red-600 bg-red-100",
  },
};

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  onLabelUpdate: (orderId: string, newLabel: string) => Promise<void>;
  onMarkProcessed: (orderId: string) => Promise<void>;
}

function OrderCard({
  order,
  onClick,
  onLabelUpdate,
  onMarkProcessed,
}: OrderCardProps) {
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;
  const hasCustomLabel = order.label !== order.id;

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(order.label);
  const [isSaving, setIsSaving] = useState(false);
  const [isMarkingProcessed, setIsMarkingProcessed] = useState(false);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLabelValue(order.label);
    setIsEditingLabel(true);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingLabel(false);
    setLabelValue(order.label);
  };

  const handleSaveLabel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      await onLabelUpdate(order.id, labelValue);
      setIsEditingLabel(false);
    } catch (error) {
      console.error("Failed to save label:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkProcessed = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMarkingProcessed(true);
    try {
      await onMarkProcessed(order.id);
    } catch (error) {
      console.error("Failed to mark as processed:", error);
    } finally {
      setIsMarkingProcessed(false);
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveLabel(e as unknown as React.MouseEvent);
    } else if (e.key === "Escape") {
      setIsEditingLabel(false);
      setLabelValue(order.label);
    }
  };

  return (
    <Card
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {isEditingLabel ? (
                <div
                  className="flex items-center gap-1"
                  onClick={handleInputClick}
                >
                  <Input
                    value={labelValue}
                    onChange={(e) => setLabelValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-7 w-48 text-sm"
                    placeholder="Enter label..."
                    disabled={isSaving}
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveLabel}
                    disabled={isSaving}
                    className="h-7 w-7"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="h-7 w-7"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="font-medium truncate">{order.label}</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleEditClick}
                    className="h-6 w-6"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </>
              )}
              <span
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${config.className}`}
              >
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </span>
            </div>
            {hasCustomLabel && (
              <p className="text-xs text-muted-foreground font-mono">
                {order.id}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""} · $
              {formatPrice(order.total)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Updated: {formatDate(order.updatedAt)}
            </p>
          </div>

          {order.status === "confirmed" && (
            <Button
              size="sm"
              onClick={handleMarkProcessed}
              disabled={isMarkingProcessed}
              className="shrink-0 bg-action text-action-foreground hover:bg-action/90"
            >
              {isMarkingProcessed ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Processed
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const language = useLanguage();

  useEffect(() => {
    verifyAdminToken().then((isValid) => {
      if (!isValid) {
        navigate(`/${language}/admin`);
      }
      setIsCheckingAuth(false);
    });
  }, [navigate, language]);

  useEffect(() => {
    if (!isCheckingAuth) {
      loadOrders();
    }
  }, [isCheckingAuth]);

  const loadOrders = async () => {
    try {
      const response = await fetchAdminOrders();
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLabelUpdate = async (orderId: string, newLabel: string) => {
    const updatedOrder = await updateOrderLabel(orderId, newLabel);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );
  };

  const handleMarkProcessed = async (orderId: string) => {
    const updatedOrder = await updateOrderStatus(orderId, "processed");
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Group orders by status
  const confirmedOrders = orders.filter((o) => o.status === "confirmed");
  const processedOrders = orders.filter((o) => o.status === "processed");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/${language}/admin/dashboard`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <ShoppingCart className="h-5 w-5" />
            <h1 className="text-xl font-bold">Orders</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No orders found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {confirmedOrders.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Confirmed ({confirmedOrders.length})
                </h2>
                <div className="space-y-3">
                  {confirmedOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={() =>
                        navigate(`/${language}/orders/${order.id}`, {
                          state: { fromAdmin: true },
                        })
                      }
                      onLabelUpdate={handleLabelUpdate}
                      onMarkProcessed={handleMarkProcessed}
                    />
                  ))}
                </div>
              </section>
            )}

            {processedOrders.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Processed ({processedOrders.length})
                </h2>
                <div className="space-y-3">
                  {processedOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={() =>
                        navigate(`/${language}/orders/${order.id}`, {
                          state: { fromAdmin: true },
                        })
                      }
                      onLabelUpdate={handleLabelUpdate}
                      onMarkProcessed={handleMarkProcessed}
                    />
                  ))}
                </div>
              </section>
            )}

            {cancelledOrders.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Cancelled ({cancelledOrders.length})
                </h2>
                <div className="space-y-3">
                  {cancelledOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={() =>
                        navigate(`/${language}/orders/${order.id}`, {
                          state: { fromAdmin: true },
                        })
                      }
                      onLabelUpdate={handleLabelUpdate}
                      onMarkProcessed={handleMarkProcessed}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
