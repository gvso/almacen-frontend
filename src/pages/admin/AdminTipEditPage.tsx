import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Trash2, Languages, Lightbulb, Tag, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ImageDropzone } from "@/components/ImageDropzone";
import {
  getTip,
  createTip,
  updateTip,
  deleteTip,
  createOrUpdateTipTranslation,
  deleteTipTranslation,
  verifyAdminToken,
  fetchAdminTags,
  addTipTag,
  removeTipTag,
} from "@/services/admin";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AdminTip, TipType } from "@/types/Tip";
import type { AdminTag } from "@/types/Tag";
import { useToast } from "@/hooks/use-toast";

const SUPPORTED_LANGUAGES = ["en", "es"];

const tipSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
});

const translationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

type TipFormData = z.infer<typeof tipSchema>;
type TranslationFormData = z.infer<typeof translationSchema>;

export default function AdminTipEditPage() {
  const { tipId } = useParams<{ tipId: string }>();
  const [searchParams] = useSearchParams();
  const isNewTip = tipId === "new";
  const defaultTipType = (searchParams.get("type") as TipType) || "quick_tip";
  const [tip, setTip] = useState<AdminTip | null>(null);
  const [tipType, setTipType] = useState<TipType>(defaultTipType);
  const [allTags, setAllTags] = useState<AdminTag[]>([]);
  const [isSavingTags, setIsSavingTags] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNewTip);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const language = useLanguage();
  const { toast } = useToast();

  // Check if we came from the marketplace
  const fromMarketplace = (location.state as { fromMarketplace?: string })?.fromMarketplace;
  const isBusiness = tipType === "business";

  const form = useForm<TipFormData>({
    resolver: zodResolver(tipSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      isActive: true,
    },
  });

  const description = useWatch({ control: form.control, name: "description" });
  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });

  useEffect(() => {
    verifyAdminToken().then((isValid) => {
      if (!isValid) {
        navigate(`/${language}/admin`);
      }
      setIsCheckingAuth(false);
    });
  }, [navigate, language]);

  const loadTip = useCallback(async () => {
    try {
      const found = await getTip(Number(tipId));
      if (found) {
        setTip(found);
        setTipType(found.tipType);
        form.reset({
          title: found.title,
          description: found.description || "",
          imageUrl: found.imageUrl || "",
          isActive: found.isActive,
        });
      }
    } catch (error) {
      console.error("Failed to load tip:", error);
    } finally {
      setIsLoading(false);
    }
  }, [tipId, form]);

  // Load tip category tags for business tips
  useEffect(() => {
    if (!isCheckingAuth) {
      fetchAdminTags().then((response) => {
        // Filter to only show tip category tags
        setAllTags(response.data.filter((tag) => tag.category === "tip"));
      });
    }
  }, [isCheckingAuth]);

  useEffect(() => {
    if (!isCheckingAuth && tipId && !isNewTip) {
      loadTip();
    }
  }, [isCheckingAuth, tipId, isNewTip, loadTip]);

  const handleGoBack = () => {
    if (fromMarketplace) {
      navigate(fromMarketplace);
    } else {
      // Fallback: navigate to admin tips page with appropriate tab
      navigate(`/${language}/admin/tips?type=${tipType}`);
    }
  };

  const handleSaveTip = async (data: TipFormData) => {
    try {
      if (isNewTip) {
        const created = await createTip({
          title: data.title,
          description: data.description,
          image_url: data.imageUrl || undefined,
          is_active: data.isActive,
          tip_type: tipType,
        });
        navigate(`/${language}/admin/tips/${created.id}`, { replace: true });
        toast({ description: "Tip created" });
      } else if (tip) {
        const updated = await updateTip(tip.id, {
          title: data.title,
          description: data.description,
          image_url: data.imageUrl || null,
          is_active: data.isActive,
          tip_type: tipType,
        });
        setTip(updated);
        setTipType(updated.tipType);
        form.reset(data);
        toast({ description: "Tip saved" });
      }
    } catch (error) {
      console.error("Failed to save tip:", error);
      toast({ description: "Failed to save tip", variant: "destructive" });
    }
  };

  const handleToggleTag = async (tagId: number) => {
    if (!tip) return;
    setIsSavingTags(true);
    try {
      const currentTagIds = tip.tags?.map((t) => t.id) || [];
      const isSelected = currentTagIds.includes(tagId);

      let result;
      if (isSelected) {
        result = await removeTipTag(tip.id, tagId);
      } else {
        result = await addTipTag(tip.id, { tag_id: tagId });
      }

      setTip({ ...tip, tags: result.data });
    } catch (error) {
      console.error("Failed to update tags:", error);
    } finally {
      setIsSavingTags(false);
    }
  };

  const handleSaveTranslation = async (lang: string, data: TranslationFormData) => {
    if (!tip) return;
    try {
      const updated = await createOrUpdateTipTranslation(tip.id, {
        language: lang,
        title: data.title,
        description: data.description,
      });
      setTip(updated);
      toast({ description: "Translation saved" });
    } catch (error) {
      console.error("Failed to save translation:", error);
      toast({ description: "Failed to save translation", variant: "destructive" });
    }
  };

  const handleDeleteTranslation = async (lang: string) => {
    if (!tip) return;
    try {
      const updated = await deleteTipTranslation(tip.id, lang);
      setTip(updated);
      toast({ description: "Translation deleted" });
    } catch (error) {
      console.error("Failed to delete translation:", error);
      toast({ description: "Failed to delete translation", variant: "destructive" });
    }
  };

  const handleDeleteTip = async () => {
    if (!tip) return;
    if (!window.confirm(`Are you sure you want to delete "${tip.title}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteTip(tip.id);
      navigate(`/${language}/admin/tips`);
    } catch (error) {
      console.error("Failed to delete tip:", error);
      toast({ description: "Failed to delete tip", variant: "destructive" });
    }
  };

  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tip && !isNewTip) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleGoBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Tip Not Found</h1>
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
            {isBusiness ? <Building2 className="h-5 w-5" /> : <Lightbulb className="h-5 w-5" />}
            <h1 className="text-xl font-bold">
              {isNewTip ? (isBusiness ? "New Business" : "New Tip") : (isBusiness ? "Edit Business" : "Edit Tip")}
            </h1>
          </div>
          {!isNewTip && (
            <Button variant="destructive" size="sm" onClick={handleDeleteTip}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {isBusiness ? "Business" : "Tip"}
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Base Tip Info */}
        <Card>
          <CardHeader>
            <CardTitle>{isBusiness ? "Business" : "Tip"} Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSaveTip)} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image on the left */}
                <div className="w-full md:w-64 shrink-0">
                  <label className="text-sm font-medium block mb-2">Image (Optional)</label>
                  <ImageDropzone
                    value={imageUrl || ""}
                    onChange={(url) => form.setValue("imageUrl", url, { shouldDirty: true })}
                  />
                </div>

                {/* Form fields on the right */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title (Default)</label>
                    <Input {...form.register("title")} placeholder={`Enter ${isBusiness ? "business" : "tip"} title`} />
                    {form.formState.errors.title && (
                      <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description (Default)</label>
                    <RichTextEditor
                      value={description}
                      onChange={(value) => form.setValue("description", value, { shouldDirty: true })}
                      placeholder={`Enter ${isBusiness ? "business" : "tip"} description`}
                    />
                    {form.formState.errors.description && (
                      <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
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
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || (!isNewTip && !form.formState.isDirty)}
                  className="bg-action text-action-foreground hover:bg-action/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {form.formState.isSubmitting ? "Saving..." : isNewTip ? `Create ${isBusiness ? "Business" : "Tip"}` : `Save ${isBusiness ? "Business" : "Tip"}`}
                </Button>
              </div>
            </form>

            {/* Tags section inside details card (for business tips) */}
            {isBusiness && !isNewTip && (
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5" />
                  <h3 className="font-semibold">Categories</h3>
                </div>
                {allTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No tags available. <a href={`/${language}/admin/tags`} className="text-primary underline">Create tags</a> first.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => {
                      const isSelected = tip?.tags?.some((t) => t.id === tag.id) || false;
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleToggleTag(tag.id)}
                          disabled={isSavingTags}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                            } ${isSavingTags ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
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
        <Card className={isNewTip ? "opacity-60" : undefined}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Translations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isNewTip ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Save the tip first to add translations.
              </p>
            ) : (
              SUPPORTED_LANGUAGES.map((lang) => {
                const existing = tip!.translations.find((t) => t.language === lang);
                return (
                  <TranslationForm
                    key={`${lang}-${existing?.title || ""}-${existing?.description || ""}`}
                    language={lang}
                    initialTitle={existing?.title || ""}
                    initialDescription={existing?.description || ""}
                    onSave={(data) => handleSaveTranslation(lang, data)}
                    onDelete={existing ? () => handleDeleteTranslation(lang) : undefined}
                  />
                );
              })
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
  initialTitle: string;
  initialDescription: string;
  onSave: (data: TranslationFormData) => Promise<void>;
  onDelete?: () => void;
}

function TranslationForm({ language, initialTitle, initialDescription, onSave, onDelete }: TranslationFormProps) {
  const form = useForm<TranslationFormData>({
    resolver: zodResolver(translationSchema),
    defaultValues: {
      title: initialTitle,
      description: initialDescription,
    },
  });

  const description = useWatch({ control: form.control, name: "description" });

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
      <div className="space-y-3">
        <Input placeholder="Translated title" {...form.register("title")} />
        <RichTextEditor
          value={description}
          onChange={(value) => form.setValue("description", value, { shouldDirty: true })}
          placeholder="Translated description..."
        />
      </div>
    </div>
  );
}
