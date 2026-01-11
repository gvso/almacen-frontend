import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Languages, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchAdminProducts,
  updateProduct,
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

export default function AdminProductEditPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const language = useLanguage();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    verifyAdminToken().then((isValid) => {
      if (!isValid) {
        navigate(`/${language}/admin`);
      }
      setIsCheckingAuth(false);
    });
  }, [navigate, language]);

  useEffect(() => {
    if (!isCheckingAuth && productId) {
      loadProduct();
    }
  }, [isCheckingAuth, productId]);

  const loadProduct = async () => {
    try {
      const response = await fetchAdminProducts();
      const found = response.data.find((p) => p.id === Number(productId));
      if (found) {
        setProduct(found);
        setName(found.name);
        setDescription(found.description || "");
        setPrice(found.price);
        setImageUrl(found.imageUrl || "");
        setOrder(found.order);
        setIsActive(found.isActive);
      }
    } catch (error) {
      console.error("Failed to load product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!product) return;
    setIsSaving(true);
    try {
      const updated = await updateProduct(product.id, {
        name,
        description: description || null,
        price,
        image_url: imageUrl || null,
        order,
        is_active: isActive,
      });
      setProduct(updated);
    } catch (error) {
      console.error("Failed to update product:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTranslation = async (lang: string, transName: string, transDesc: string) => {
    if (!product) return;
    try {
      const updated = await createOrUpdateTranslation(product.id, {
        language: lang,
        name: transName,
        description: transDesc || null,
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

  const handleUpdateVariation = async (
    variationId: number,
    data: { name?: string; price?: string | null; image_url?: string | null; order?: number; is_active?: boolean }
  ) => {
    if (!product) return;
    try {
      const updated = await updateVariation(product.id, variationId, data);
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

  const handleSaveVariationTranslation = async (variationId: number, lang: string, transName: string) => {
    if (!product) return;
    try {
      const updated = await createOrUpdateVariationTranslation(product.id, variationId, {
        language: lang,
        name: transName,
      });
      setProduct(updated);
    } catch (error) {
      console.error("Failed to save variation translation:", error);
    }
  };

  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
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
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/${language}/admin/products`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Edit Product</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Base Product Info */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name (Default)</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Default)</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL</label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Order</label>
                <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center gap-2 h-9">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="isActive" className="text-sm">Active</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveProduct} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Translations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Translations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const existing = product.translations.find((t) => t.language === lang);
              return (
                <TranslationRow
                  key={lang}
                  language={lang}
                  name={existing?.name || ""}
                  description={existing?.description || ""}
                  onSave={(n, d) => handleSaveTranslation(lang, n, d)}
                  onDelete={existing ? () => handleDeleteTranslation(lang) : undefined}
                />
              );
            })}
          </CardContent>
        </Card>

        {/* Variations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Variations
            </CardTitle>
            <Button size="sm" onClick={handleAddVariation}>
              <Plus className="h-4 w-4 mr-2" />
              Add Variation
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.variations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No variations yet.</p>
            ) : (
              <>
                {/* Column headers */}
                <div className="hidden md:grid grid-cols-5 gap-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                  <span>Name</span>
                  <span>Price</span>
                  <span>Image URL</span>
                  <span>Order</span>
                  <span>Status</span>
                </div>
                {product.variations.map((variation) => (
                  <VariationCard
                    key={`${variation.id}-${JSON.stringify(variation.translations)}`}
                    variation={variation}
                    onUpdate={(data) => handleUpdateVariation(variation.id, data)}
                    onDelete={() => handleDeleteVariation(variation.id)}
                    onSaveTranslation={(lang, name) => handleSaveVariationTranslation(variation.id, lang, name)}
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

interface TranslationRowProps {
  language: string;
  name: string;
  description: string;
  onSave: (name: string, description: string) => void;
  onDelete?: () => void;
}

function TranslationRow({ language, name: initialName, description: initialDesc, onSave, onDelete }: TranslationRowProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDesc);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setName(initialName);
    setDescription(initialDesc);
    setIsDirty(false);
  }, [initialName, initialDesc]);

  const handleChange = (n: string, d: string) => {
    setName(n);
    setDescription(d);
    setIsDirty(true);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium uppercase">{language}</span>
        <div className="flex gap-2">
          {isDirty && (
            <Button size="sm" variant="outline" onClick={() => onSave(name, description)}>
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
        <Input
          placeholder="Translated name"
          value={name}
          onChange={(e) => handleChange(e.target.value, description)}
        />
        <Input
          placeholder="Translated description"
          value={description}
          onChange={(e) => handleChange(name, e.target.value)}
        />
      </div>
    </div>
  );
}

interface VariationCardProps {
  variation: AdminVariation;
  onUpdate: (data: { name?: string; price?: string | null; image_url?: string | null; order?: number; is_active?: boolean }) => void;
  onDelete: () => void;
  onSaveTranslation: (language: string, name: string) => void;
}

function VariationCard({ variation, onUpdate, onDelete, onSaveTranslation }: VariationCardProps) {
  const [name, setName] = useState(variation.name);
  const [price, setPrice] = useState(variation.price || "");
  const [imageUrl, setImageUrl] = useState(variation.imageUrl || "");
  const [order, setOrder] = useState(variation.order);
  const [isActive, setIsActive] = useState(variation.isActive);
  const [isDirty, setIsDirty] = useState(false);
  const hasTranslations = variation.translations && variation.translations.length > 0;
  const [showTranslations, setShowTranslations] = useState(hasTranslations);

  useEffect(() => {
    setName(variation.name);
    setPrice(variation.price || "");
    setImageUrl(variation.imageUrl || "");
    setOrder(variation.order);
    setIsActive(variation.isActive);
    setIsDirty(false);
    if (variation.translations && variation.translations.length > 0) {
      setShowTranslations(true);
    }
  }, [variation]);

  const handleSave = () => {
    onUpdate({
      name,
      price: price || null,
      image_url: imageUrl || null,
      order,
      is_active: isActive,
    });
    setIsDirty(false);
  };

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
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
        />
        <Input
          placeholder="Price (optional)"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => { setPrice(e.target.value); setIsDirty(true); }}
        />
        <Input
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => { setImageUrl(e.target.value); setIsDirty(true); }}
        />
        <Input
          placeholder="Order"
          type="number"
          value={order}
          onChange={(e) => { setOrder(Number(e.target.value)); setIsDirty(true); }}
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => { setIsActive(e.target.checked); setIsDirty(true); }}
            className="h-4 w-4"
          />
          <span className="text-sm">Active</span>
          {isDirty && (
            <Button size="sm" onClick={handleSave} className="ml-auto">
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
              <VariationTranslationRow
                key={`${variation.id}-${lang}`}
                language={lang}
                name={existing?.name || ""}
                onSave={(n) => onSaveTranslation(lang, n)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface VariationTranslationRowProps {
  language: string;
  name: string;
  onSave: (name: string) => void;
}

function VariationTranslationRow({ language, name: initialName, onSave }: VariationTranslationRowProps) {
  const [name, setName] = useState(initialName);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setName(initialName);
    setIsDirty(false);
  }, [initialName]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium uppercase w-8">{language}</span>
      <Input
        placeholder="Translated name"
        value={name}
        onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
        className="flex-1"
      />
      {isDirty && (
        <Button size="sm" variant="outline" onClick={() => { onSave(name); setIsDirty(false); }}>
          <Save className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
