import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, X, Package, Wrench, Plus, Search, Trash2, GripVertical, Sparkles } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchAdminProducts, deleteProduct, reorderProducts, verifyAdminToken } from "@/services/admin";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDebounce } from "@/hooks/useDebounce";
import type { AdminProduct, ProductType } from "@/types/AdminProduct";

interface SortableProductCardProps {
  product: AdminProduct;
  onNavigate: () => void;
  onDelete: () => void;
}

function SortableProductCard({ product, onNavigate, onDelete }: SortableProductCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`hover:bg-muted/50 transition-colors ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing touch-none p-1 text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div
            className="flex-1 flex items-center gap-4 cursor-pointer"
            onClick={onNavigate}
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{product.name}</h3>
              <div className="mt-1">
                {product.isActive ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                    <Check className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                    <X className="h-3 w-3" /> Inactive
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                ${Number(product.price).toFixed(2)} · {product.variations.length} variations · {product.translations.length} translations
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Map route to product type for API
const routeToProductType: Record<string, ProductType> = {
  products: "product",
  services: "service",
  housekeeping: "housekeeping",
};

// Map route to display info
const routeConfig: Record<string, { title: string; label: string; icon: typeof Package }> = {
  products: { title: "Fridge Stocking", label: "Product", icon: Package },
  services: { title: "Celebration & Decor", label: "Service", icon: Wrench },
  housekeeping: { title: "Housekeeping", label: "Service", icon: Sparkles },
};

export default function AdminProductsPage() {
  const { itemType } = useParams<{ itemType: string }>();
  const productType: ProductType = routeToProductType[itemType || "products"] || "product";
  const config = routeConfig[itemType || "products"] || routeConfig.products;
  const pageTitle = config.title;
  const itemLabel = config.label;
  const ItemIcon = config.icon;

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const navigate = useNavigate();
  const language = useLanguage();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    verifyAdminToken().then((isValid) => {
      if (!isValid) {
        navigate(`/${language}/admin`);
      }
      setIsCheckingAuth(false);
    });
  }, [navigate, language]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchAdminProducts({
        search: debouncedSearch || undefined,
        type: productType,
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, productType]);

  useEffect(() => {
    if (!isCheckingAuth) {
      loadProducts();
    }
  }, [isCheckingAuth, loadProducts]);

  const handleAddProduct = () => {
    navigate(`/${language}/admin/${itemType}/new`);
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteProduct(productId);
      setProducts(products.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = products.findIndex((p) => p.id === active.id);
      const newIndex = products.findIndex((p) => p.id === over.id);

      const newProducts = arrayMove(products, oldIndex, newIndex);
      setProducts(newProducts);

      // Save new order to backend
      try {
        const items = newProducts.map((p, index) => ({ id: p.id, order: index }));
        await reorderProducts(items);
      } catch (error) {
        console.error("Failed to save order:", error);
        // Revert on error
        loadProducts();
      }
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/${language}/admin/dashboard`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <ItemIcon className="h-5 w-5" />
            <h1 className="text-xl font-bold">{pageTitle}</h1>
          </div>
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add {itemLabel}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`Search ${pageTitle.toLowerCase()}...`}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No {pageTitle.toLowerCase()} found.
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={products.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {products.map((product) => (
                  <SortableProductCard
                    key={product.id}
                    product={product}
                    onNavigate={() => navigate(`/${language}/admin/${itemType}/${product.id}`)}
                    onDelete={() => handleDeleteProduct(product.id, product.name)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>
    </div>
  );
}
