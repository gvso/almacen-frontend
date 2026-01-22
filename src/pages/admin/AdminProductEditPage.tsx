import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Plus, Trash2, Languages, Layers, GripVertical, Package, Wrench, Tags, Check } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageDropzone } from "@/components/ImageDropzone";
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
  deleteVariationTranslation,
  reorderVariations,
  verifyAdminToken,
  fetchAdminTags,
  updateProductTags,
} from "@/services/admin";
import type { AdminTag } from "@/types/Tag";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AdminProduct, AdminVariation, ProductType } from "@/types/AdminProduct";
import { useToast } from "@/hooks/use-toast";

const SUPPORTED_LANGUAGES = ["en", "es"];

// Zod Schemas
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  price: z.string().min(1, "Price is required"),
  imageUrl: z.string(),
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
  isActive: z.boolean(),
});

const variationTranslationSchema = z.object({
  name: z.string(),
});

type ProductFormData = z.infer<typeof productSchema>;
type TranslationFormData = z.infer<typeof translationSchema>;
type VariationFormData = z.infer<typeof variationSchema>;
type VariationTranslationFormData = z.infer<typeof variationTranslationSchema>;

export default function AdminProductEditPage() {
  const { productId, itemType } = useParams<{ productId: string; itemType: string }>();
  const productType: ProductType = itemType === "services" ? "service" : itemType === "housekeeping" ? "housekeeping" : "product";
  const isService = productType === "service" || productType === "housekeeping";
  const showVariations = productType === "product" || productType === "service";
  const itemLabel = isService ? "Service" : "Product";
  const ItemIcon = isService ? Wrench : Package;

  const isNewProduct = productId === "new";
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [allTags, setAllTags] = useState<AdminTag[]>([]);
  const [isLoading, setIsLoading] = useState(!isNewProduct);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSavingTags, setIsSavingTags] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const language = useLanguage();
  const { toast } = useToast();

  // Check if we came from the marketplace
  const fromMarketplace = (location.state as { fromMarketplace?: string })?.fromMarketplace;

  const handleGoBack = () => {
    if (fromMarketplace) {
      navigate(fromMarketplace);
    } else {
      navigate(`/${language}/admin/${itemType}`);
    }
  };

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      isActive: true,
    },
  });

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

  const loadProduct = useCallback(async () => {
    try {
      const [productsResponse, tagsResponse] = await Promise.all([
        fetchAdminProducts({ type: productType }),
        fetchAdminTags(),
      ]);
      setAllTags(tagsResponse.data);
      const found = productsResponse.data.find((p) => p.id === Number(productId));
      if (found) {
        setProduct(found);
        form.reset({
          name: found.name,
          description: found.description || "",
          price: found.price,
          imageUrl: found.imageUrl || "",
          isActive: found.isActive,
        });
      }
    } catch (error) {
      console.error("Failed to load product:", error);
    } finally {
      setIsLoading(false);
    }
  }, [productId, productType, form]);

  const loadTags = useCallback(async () => {
    try {
      const tagsResponse = await fetchAdminTags();
      setAllTags(tagsResponse.data);
    } catch (error) {
      console.error("Failed to load tags:", error);
    }
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && productId && !isNewProduct) {
      loadProduct();
    } else if (!isCheckingAuth && isNewProduct) {
      loadTags();
    }
  }, [isCheckingAuth, productId, isNewProduct, loadProduct, loadTags]);

  const handleSaveProduct = async (data: ProductFormData) => {
    try {
      if (isNewProduct) {
        const created = await createProduct({
          name: data.name,
          description: data.description || null,
          price: data.price,
          image_url: data.imageUrl || null,
          is_active: data.isActive,
          type: productType,
        });
        navigate(`/${language}/admin/${itemType}/${created.id}`, { replace: true });
      } else if (product) {
        const updated = await updateProduct(product.id, {
          name: data.name,
          description: data.description || null,
          price: data.price,
          image_url: data.imageUrl || null,
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
      toast({ description: "Translation saved" });
    } catch (error) {
      console.error("Failed to save translation:", error);
      toast({ description: "Failed to save translation", variant: "destructive" });
    }
  };

  const handleDeleteTranslation = async (lang: string) => {
    if (!product) return;
    try {
      const updated = await deleteTranslation(product.id, lang);
      setProduct(updated);
      toast({ description: "Translation deleted" });
    } catch (error) {
      console.error("Failed to delete translation:", error);
      toast({ description: "Failed to delete translation", variant: "destructive" });
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
      toast({ description: "Variation added" });
    } catch (error) {
      console.error("Failed to add variation:", error);
      toast({ description: "Failed to add variation", variant: "destructive" });
    }
  };

  const handleUpdateVariation = async (variationId: number, data: VariationFormData) => {
    if (!product) return;
    try {
      const updated = await updateVariation(product.id, variationId, {
        name: data.name,
        price: data.price || null,
        image_url: data.imageUrl || null,
        is_active: data.isActive,
      });
      setProduct(updated);
      toast({ description: "Variation saved" });
    } catch (error) {
      console.error("Failed to update variation:", error);
      toast({ description: "Failed to save variation", variant: "destructive" });
    }
  };

  const handleDeleteVariation = async (variationId: number) => {
    if (!product) return;
    try {
      const updated = await deleteVariation(product.id, variationId);
      setProduct(updated);
      toast({ description: "Variation deleted" });
    } catch (error) {
      console.error("Failed to delete variation:", error);
      toast({ description: "Failed to delete variation", variant: "destructive" });
    }
  };

  const handleVariationDragEnd = async (event: DragEndEvent) => {
    if (!product) return;
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = product.variations.findIndex((v) => v.id === active.id);
      const newIndex = product.variations.findIndex((v) => v.id === over.id);

      const newVariations = arrayMove(product.variations, oldIndex, newIndex);
      setProduct({ ...product, variations: newVariations });

      // Save new order to backend
      try {
        const items = newVariations.map((v, index) => ({ id: v.id, order: index }));
        await reorderVariations(product.id, items);
        toast({ description: "Order saved" });
      } catch (error) {
        console.error("Failed to save variation order:", error);
        toast({ description: "Failed to save order", variant: "destructive" });
        // Reload to revert on error
        loadProduct();
      }
    }
  };

  const handleSaveVariationTranslation = async (variationId: number, lang: string, data: VariationTranslationFormData, hasExisting: boolean) => {
    if (!product) return;
    try {
      // If name is empty and there's an existing translation, delete it
      if (!data.name.trim() && hasExisting) {
        const updated = await deleteVariationTranslation(product.id, variationId, lang);
        setProduct(updated);
        toast({ description: "Translation removed" });
      } else if (data.name.trim()) {
        // Only create/update if name is not empty
        const updated = await createOrUpdateVariationTranslation(product.id, variationId, {
          language: lang,
          name: data.name,
        });
        setProduct(updated);
        toast({ description: "Translation saved" });
      }
    } catch (error) {
      console.error("Failed to save variation translation:", error);
      toast({ description: "Failed to save translation", variant: "destructive" });
    }
  };

  const handleDeleteProduct = async () => {
    if (!product) return;
    if (!window.confirm(`Are you sure you want to delete this ${itemLabel.toLowerCase()}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteProduct(product.id);
      navigate(`/${language}/admin/${itemType}`);
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleToggleTag = async (tagId: number) => {
    if (!product) return;
    setIsSavingTags(true);
    try {
      const currentTagIds = product.tags?.map((t) => t.id) || [];
      const isSelected = currentTagIds.includes(tagId);
      const newTagIds = isSelected
        ? currentTagIds.filter((id) => id !== tagId)
        : [...currentTagIds, tagId];

      await updateProductTags(product.id, { tag_ids: newTagIds });
      // Update local state
      const newTags = allTags.filter((t) => newTagIds.includes(t.id));
      setProduct({ ...product, tags: newTags });
    } catch (error) {
      console.error("Failed to update tags:", error);
    } finally {
      setIsSavingTags(false);
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
            <Button variant="ghost" size="icon" onClick={handleGoBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">{itemLabel} Not Found</h1>
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
            <Button variant="ghost" size="icon" onClick={handleGoBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <ItemIcon className="h-5 w-5" />
            <h1 className="text-xl font-bold">{isNewProduct ? `New ${itemLabel}` : `Edit ${itemLabel}`}</h1>
          </div>
          {!isNewProduct && (
            <Button variant="destructive" size="sm" onClick={handleDeleteProduct}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {itemLabel}
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Base Product Info */}
        <Card>
          <CardHeader>
            <CardTitle>{itemLabel} Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSaveProduct)} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image on the left */}
                <div className="w-full md:w-64 shrink-0">
                  <label className="text-sm font-medium block mb-2">{itemLabel} Image</label>
                  <Controller
                    name="imageUrl"
                    control={form.control}
                    render={({ field }) => (
                      <ImageDropzone
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {/* Form fields on the right */}
                <div className="flex-1 space-y-4">
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
                      <div className="flex max-w-40">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">$</span>
                        <Input type="number" step="0.01" className="rounded-l-none" {...form.register("price")} />
                      </div>
                      {form.formState.errors.price && (
                        <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description (Default)</label>
                    {isService ? (
                      <Controller
                        name="description"
                        control={form.control}
                        render={({ field }) => (
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter description with formatting..."
                          />
                        )}
                      />
                    ) : (
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        {...form.register("description")}
                      />
                    )}
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
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting || (!isNewProduct && !form.formState.isDirty)} className="bg-action text-action-foreground hover:bg-action/90">
                  <Save className="h-4 w-4 mr-2" />
                  {form.formState.isSubmitting ? "Saving..." : isNewProduct ? `Create ${itemLabel}` : `Save ${itemLabel}`}
                </Button>
              </div>
            </form>

            {/* Tags section inside details card */}
            {!isNewProduct && (
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tags className="h-5 w-5" />
                  <h3 className="font-semibold">Tags</h3>
                </div>
                {allTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No tags available. <a href={`/${language}/admin/tags`} className="text-primary underline">Create tags</a> first.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => {
                      const isSelected = product?.tags?.some((t) => t.id === tag.id) || false;
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          disabled={isSavingTags}
                          onClick={() => handleToggleTag(tag.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isSelected
                            ? "bg-action text-action-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                            } ${isSavingTags ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          {tag.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
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
                Save the {itemLabel.toLowerCase()} first to add translations.
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
                    useRichText={isService}
                  />
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Variations - only for products (fridge stocking) */}
        {showVariations && (
          <Card className={isNewProduct ? "opacity-60" : undefined}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Variations
              </CardTitle>
              <Button size="sm" onClick={handleAddVariation} disabled={isNewProduct} className="bg-action text-action-foreground hover:bg-action/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Variation
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isNewProduct ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Save the {itemLabel.toLowerCase()} first to add variations.
                </p>
              ) : product!.variations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No variations yet.</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleVariationDragEnd}
                >
                  <SortableContext
                    items={product!.variations.map((v) => v.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="hidden md:flex gap-4 px-4 text-xs font-medium text-muted-foreground uppercase items-center">
                      <span className="w-6 shrink-0"></span>
                      <span className="w-24 shrink-0 text-center">Image</span>
                      <div className="flex-1 grid grid-cols-3 gap-3 text-center">
                        <span>Name</span>
                        <span>Price</span>
                        <span>Active</span>
                      </div>
                      <span className="w-8 shrink-0"></span>
                    </div>
                    <div className="space-y-4">
                      {product!.variations.map((variation) => (
                        <SortableVariationForm
                          key={variation.id}
                          variation={variation}
                          defaultImageUrl={product!.imageUrl || ""}
                          onUpdate={(data) => handleUpdateVariation(variation.id, data)}
                          onDelete={() => handleDeleteVariation(variation.id)}
                          onSaveTranslation={(lang, data, hasExisting) => handleSaveVariationTranslation(variation.id, lang, data, hasExisting)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

// Sub-components

interface TranslationFormProps {
  language: string;
  initialName: string;
  initialDescription: string;
  onSave: (data: TranslationFormData) => Promise<void>;
  onDelete?: () => void;
  useRichText?: boolean;
}

function TranslationForm({ language, initialName, initialDescription, onSave, onDelete, useRichText }: TranslationFormProps) {
  const form = useForm<TranslationFormData>({
    resolver: zodResolver(translationSchema),
    defaultValues: {
      name: initialName,
      description: initialDescription,
    },
  });

  const handleSave = async (data: TranslationFormData) => {
    await onSave(data);
    form.reset(data);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium uppercase">{language}</span>
        <div className="flex gap-2">
          {form.formState.isDirty && (
            <Button size="sm" variant="outline" onClick={form.handleSubmit(handleSave)}>
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
      <div className={useRichText ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 gap-3"}>
        <Input placeholder="Translated name" {...form.register("name")} />
        {useRichText ? (
          <Controller
            name="description"
            control={form.control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Translated description..."
              />
            )}
          />
        ) : (
          <Input placeholder="Translated description" {...form.register("description")} />
        )}
      </div>
    </div>
  );
}

interface VariationFormProps {
  variation: AdminVariation;
  defaultImageUrl: string;
  onUpdate: (data: VariationFormData) => Promise<void>;
  onDelete: () => void;
  onSaveTranslation: (language: string, data: VariationTranslationFormData, hasExisting: boolean) => Promise<void>;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement> & { ref?: React.Ref<HTMLButtonElement> };
}

function SortableVariationForm(props: Omit<VariationFormProps, "dragHandleProps">) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.variation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
      <VariationForm {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

function VariationForm({ variation, defaultImageUrl, onUpdate, onDelete, onSaveTranslation, dragHandleProps }: VariationFormProps) {
  const hasTranslations = variation.translations && variation.translations.length > 0;
  const [showTranslations, setShowTranslations] = useState(hasTranslations);

  const form = useForm<VariationFormData>({
    resolver: zodResolver(variationSchema),
    defaultValues: {
      name: variation.name,
      price: variation.price || "",
      imageUrl: variation.imageUrl || "",
      isActive: variation.isActive,
    },
  });

  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });

  const handleImageChange = (url: string) => {
    form.setValue("imageUrl", url, { shouldDirty: true });
  };

  const handleSave = async (data: VariationFormData) => {
    await onUpdate(data);
    form.reset(data);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex gap-4 items-center">
        {/* Drag handle */}
        {dragHandleProps && (
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing touch-none p-1 text-muted-foreground hover:text-foreground"
            {...dragHandleProps}
          >
            <GripVertical className="h-5 w-5" />
          </button>
        )}

        {/* Image dropzone */}
        <div className="w-24 shrink-0">
          <ImageDropzone
            value={imageUrl}
            onChange={handleImageChange}
            compact
            fallbackImage={defaultImageUrl}
          />
        </div>

        {/* Form fields */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 items-center">
          <div className="flex justify-center">
            <Input placeholder="Name" {...form.register("name")} />
          </div>
          <div className="flex justify-center">
            <div className="flex max-w-32">
              <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">$</span>
              <Input placeholder="Price" type="number" step="0.01" className="rounded-l-none" {...form.register("price")} />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <input type="checkbox" {...form.register("isActive")} className="h-4 w-4" />
            {form.formState.isDirty && (
              <Button size="sm" onClick={form.handleSubmit(handleSave)} className="bg-action text-action-foreground hover:bg-action/90">
                <Save className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Delete button */}
        <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex justify-start">
        <Button
          size="sm"
          variant={showTranslations ? "secondary" : "ghost"}
          onClick={() => setShowTranslations(!showTranslations)}
        >
          <Languages className="h-3 w-3 mr-1" /> Translations
        </Button>
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
                hasExisting={!!existing}
                onSave={async (data, hasExisting) => onSaveTranslation(lang, data, hasExisting)}
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
  hasExisting: boolean;
  onSave: (data: VariationTranslationFormData, hasExisting: boolean) => Promise<void>;
}

function VariationTranslationForm({ language, initialName, hasExisting, onSave }: VariationTranslationFormProps) {
  const form = useForm<VariationTranslationFormData>({
    resolver: zodResolver(variationTranslationSchema),
    defaultValues: {
      name: initialName,
    },
  });

  const handleSave = async (data: VariationTranslationFormData) => {
    await onSave(data, hasExisting);
    form.reset(data);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium uppercase w-8">{language}</span>
      <Input placeholder="Translated name" {...form.register("name")} className="flex-1" />
      {form.formState.isDirty && (
        <Button size="sm" variant="outline" onClick={form.handleSubmit(handleSave)}>
          <Save className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
