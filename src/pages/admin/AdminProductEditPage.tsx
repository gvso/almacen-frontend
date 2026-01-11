import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Plus, Trash2, Languages, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrUpdateTranslation,
  deleteTranslation,
  createVariation,
  updateVariation,
  deleteVariation,
  createOrUpdateVariationTranslation,
  verifyAdminToken,
} from "@/services/admin";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AdminProduct, AdminVariation } from "@/types/AdminProduct";

const SUPPORTED_LANGUAGES = ["en", "es"];

// Zod Schemas
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  price: z.string().min(1, "Price is required"),
  imageUrl: z.string(),
  order: z.number().int(),
  isActive: z.boolean(),
});

const translationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
});

const variationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.string(),
  imageUrl: z.string(),
  order: z.number().int(),
  isActive: z.boolean(),
});

const variationTranslationSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type ProductFormData = z.infer<typeof productSchema>;
type TranslationFormData = z.infer<typeof translationSchema>;
type VariationFormData = z.infer<typeof variationSchema>;
type VariationTranslationFormData = z.infer<typeof variationTranslationSchema>;

export default function AdminProductEditPage() {
  const { productId } = useParams<{ productId: string }>();
  const isNewProduct = productId === "new";
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [isLoading, setIsLoading] = useState(!isNewProduct);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const language = useLanguage();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      order: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    verifyAdminToken().then((isValid) => {
      if (!isValid) {
        navigate(`/${language}/admin`);
      }
      setIsCheckingAuth(false);
    });
  }, [navigate, language]);

  const loadProduct = useCallback(async () => {
    try {
      const response = await fetchAdminProducts();
      const found = response.data.find((p) => p.id === Number(productId));
      if (found) {
        setProduct(found);
        form.reset({
          name: found.name,
          description: found.description || "",
          price: found.price,
          imageUrl: found.imageUrl || "",
          order: found.order,
          isActive: found.isActive,
        });
      }
    } catch (error) {
      console.error("Failed to load product:", error);
    } finally {
      setIsLoading(false);
    }
  }, [productId, form]);

  useEffect(() => {
    if (!isCheckingAuth && productId && !isNewProduct) {
      loadProduct();
    }
  }, [isCheckingAuth, productId, isNewProduct, loadProduct]);

  const handleSaveProduct = async (data: ProductFormData) => {
    try {
      if (isNewProduct) {
        const created = await createProduct({
          name: data.name,
          description: data.description || null,
          price: data.price,
          image_url: data.imageUrl || null,
          order: data.order,
          is_active: data.isActive,
        });
        navigate(`/${language}/admin/products/${created.id}`, { replace: true });
      } else if (product) {
        const updated = await updateProduct(product.id, {
          name: data.name,
          description: data.description || null,
          price: data.price,
          image_url: data.imageUrl || null,
          order: data.order,
          is_active: data.isActive,
        });
        setProduct(updated);
        form.reset(data);
      }
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  const handleSaveTranslation = async (lang: string, data: TranslationFormData) => {
    if (!product) return;
    try {
      const updated = await createOrUpdateTranslation(product.id, {
        language: lang,
        name: data.name,
        description: data.description || null,
      });
      setProduct(updated);
    } catch (error) {
      console.error("Failed to save translation:", error);
    }
  };

  const handleDeleteTranslation = async (lang: string) => {
    if (!product) return;
    try {
      const updated = await deleteTranslation(product.id, lang);
      setProduct(updated);
    } catch (error) {
      console.error("Failed to delete translation:", error);
    }
  };

  const handleAddVariation = async () => {
    if (!product) return;
    try {
      const updated = await createVariation(product.id, {
        name: "New Variation",
        order: product.variations.length,
      });
      setProduct(updated);
    } catch (error) {
      console.error("Failed to add variation:", error);
    }
  };

  const handleUpdateVariation = async (variationId: number, data: VariationFormData) => {
    if (!product) return;
    try {
      const updated = await updateVariation(product.id, variationId, {
        name: data.name,
        price: data.price || null,
        image_url: data.imageUrl || null,
        order: data.order,
        is_active: data.isActive,
      });
      setProduct(updated);
    } catch (error) {
      console.error("Failed to update variation:", error);
    }
  };

  const handleDeleteVariation = async (variationId: number) => {
    if (!product) return;
    try {
      const updated = await deleteVariation(product.id, variationId);
      setProduct(updated);
    } catch (error) {
      console.error("Failed to delete variation:", error);
    }
  };

  const handleSaveVariationTranslation = async (variationId: number, lang: string, data: VariationTranslationFormData) => {
    if (!product) return;
    try {
      const updated = await createOrUpdateVariationTranslation(product.id, variationId, {
        language: lang,
        name: data.name,
      });
      setProduct(updated);
    } catch (error) {
      console.error("Failed to save variation translation:", error);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product) return;
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteProduct(product.id);
      navigate(`/${language}/admin/products`);
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product && !isNewProduct) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/${language}/admin/products`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Product Not Found</h1>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/${language}/admin/products`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">{isNewProduct ? "New Product" : "Edit Product"}</h1>
          </div>
          {!isNewProduct && (
            <Button variant="destructive" size="sm" onClick={handleDeleteProduct}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Product
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Base Product Info */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSaveProduct)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name (Default)</label>
                  <Input {...form.register("name")} />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <Input type="number" step="0.01" {...form.register("price")} />
                  {form.formState.errors.price && (
                    <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Default)</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...form.register("description")}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <Input {...form.register("imageUrl")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order</label>
                  <Input type="number" {...form.register("order", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex items-center gap-2 h-9">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...form.register("isActive")}
                      className="h-4 w-4"
                    />
                    <label htmlFor="isActive" className="text-sm">Active</label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting || (!isNewProduct && !form.formState.isDirty)}>
                  <Save className="h-4 w-4 mr-2" />
                  {form.formState.isSubmitting ? "Saving..." : isNewProduct ? "Create Product" : "Save Product"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Translations */}
        <Card className={isNewProduct ? "opacity-60" : undefined}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Translations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isNewProduct ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Save the product first to add translations.
              </p>
            ) : (
              SUPPORTED_LANGUAGES.map((lang) => {
                const existing = product!.translations.find((t) => t.language === lang);
                return (
                  <TranslationForm
                    key={`${lang}-${existing?.name || ""}-${existing?.description || ""}`}
                    language={lang}
                    initialName={existing?.name || ""}
                    initialDescription={existing?.description || ""}
                    onSave={(data) => handleSaveTranslation(lang, data)}
                    onDelete={existing ? () => handleDeleteTranslation(lang) : undefined}
                  />
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Variations */}
        <Card className={isNewProduct ? "opacity-60" : undefined}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Variations
            </CardTitle>
            <Button size="sm" onClick={handleAddVariation} disabled={isNewProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Add Variation
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isNewProduct ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Save the product first to add variations.
              </p>
            ) : product!.variations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No variations yet.</p>
            ) : (
              <>
                <div className="hidden md:grid grid-cols-5 gap-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                  <span>Name</span>
                  <span>Price</span>
                  <span>Image URL</span>
                  <span>Order</span>
                  <span>Status</span>
                </div>
                {product!.variations.map((variation) => (
                  <VariationForm
                    key={`${variation.id}-${JSON.stringify(variation)}`}
                    variation={variation}
                    onUpdate={(data) => handleUpdateVariation(variation.id, data)}
                    onDelete={() => handleDeleteVariation(variation.id)}
                    onSaveTranslation={(lang, data) => handleSaveVariationTranslation(variation.id, lang, data)}
                  />
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Sub-components

interface TranslationFormProps {
  language: string;
  initialName: string;
  initialDescription: string;
  onSave: (data: TranslationFormData) => void;
  onDelete?: () => void;
}

function TranslationForm({ language, initialName, initialDescription, onSave, onDelete }: TranslationFormProps) {
  const form = useForm<TranslationFormData>({
    resolver: zodResolver(translationSchema),
    defaultValues: {
      name: initialName,
      description: initialDescription,
    },
  });

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium uppercase">{language}</span>
        <div className="flex gap-2">
          {form.formState.isDirty && (
            <Button size="sm" variant="outline" onClick={form.handleSubmit(onSave)}>
              <Save className="h-3 w-3 mr-1" /> Save
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input placeholder="Translated name" {...form.register("name")} />
        <Input placeholder="Translated description" {...form.register("description")} />
      </div>
    </div>
  );
}

interface VariationFormProps {
  variation: AdminVariation;
  onUpdate: (data: VariationFormData) => void;
  onDelete: () => void;
  onSaveTranslation: (language: string, data: VariationTranslationFormData) => void;
}

function VariationForm({ variation, onUpdate, onDelete, onSaveTranslation }: VariationFormProps) {
  const hasTranslations = variation.translations && variation.translations.length > 0;
  const [showTranslations, setShowTranslations] = useState(hasTranslations);

  const form = useForm<VariationFormData>({
    resolver: zodResolver(variationSchema),
    defaultValues: {
      name: variation.name,
      price: variation.price || "",
      imageUrl: variation.imageUrl || "",
      order: variation.order,
      isActive: variation.isActive,
    },
  });

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => setShowTranslations(!showTranslations)}>
          <Languages className="h-3 w-3 mr-1" /> Translations
        </Button>
        <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Input placeholder="Name" {...form.register("name")} />
        <Input placeholder="Price (optional)" type="number" step="0.01" {...form.register("price")} />
        <Input placeholder="Image URL" {...form.register("imageUrl")} />
        <Input placeholder="Order" type="number" {...form.register("order", { valueAsNumber: true })} />
        <div className="flex items-center gap-2">
          <input type="checkbox" {...form.register("isActive")} className="h-4 w-4" />
          <span className="text-sm">Active</span>
          {form.formState.isDirty && (
            <Button size="sm" onClick={form.handleSubmit(onUpdate)} className="ml-auto">
              <Save className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {showTranslations && (
        <div className="mt-3 pt-3 border-t space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Variation Translations</p>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const existing = variation.translations?.find((t) => t.language === lang);
            return (
              <VariationTranslationForm
                key={`${variation.id}-${lang}-${existing?.name || ""}`}
                language={lang}
                initialName={existing?.name || ""}
                onSave={(data) => onSaveTranslation(lang, data)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface VariationTranslationFormProps {
  language: string;
  initialName: string;
  onSave: (data: VariationTranslationFormData) => void;
}

function VariationTranslationForm({ language, initialName, onSave }: VariationTranslationFormProps) {
  const form = useForm<VariationTranslationFormData>({
    resolver: zodResolver(variationTranslationSchema),
    defaultValues: {
      name: initialName,
    },
  });

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium uppercase w-8">{language}</span>
      <Input placeholder="Translated name" {...form.register("name")} className="flex-1" />
      {form.formState.isDirty && (
        <Button size="sm" variant="outline" onClick={form.handleSubmit(onSave)}>
          <Save className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
