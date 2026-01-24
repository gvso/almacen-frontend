import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Trash2, Languages, Lightbulb, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  getTip,
  createTip,
  updateTip,
  deleteTip,
  createOrUpdateTipTranslation,
  deleteTipTranslation,
  verifyAdminToken,
} from "@/services/admin";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AdminTip } from "@/types/Tip";
import { useToast } from "@/hooks/use-toast";

const SUPPORTED_LANGUAGES = ["en", "es"];

const tipSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
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
  const isNewTip = tipId === "new";
  const [tip, setTip] = useState<AdminTip | null>(null);
  const [isLoading, setIsLoading] = useState(!isNewTip);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const language = useLanguage();
  const { toast } = useToast();

  // Check if we came from the marketplace
  const fromMarketplace = (location.state as { fromMarketplace?: string })?.fromMarketplace;

  const form = useForm<TipFormData>({
    resolver: zodResolver(tipSchema),
    defaultValues: {
      title: "",
      description: "",
      isActive: true,
    },
  });

  const description = useWatch({ control: form.control, name: "description" });
  const isActive = useWatch({ control: form.control, name: "isActive" });

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
        form.reset({
          title: found.title,
          description: found.description || "",
          isActive: found.isActive,
        });
      }
    } catch (error) {
      console.error("Failed to load tip:", error);
    } finally {
      setIsLoading(false);
    }
  }, [tipId, form]);

  useEffect(() => {
    if (!isCheckingAuth && tipId && !isNewTip) {
      loadTip();
    }
  }, [isCheckingAuth, tipId, isNewTip, loadTip]);

  const handleGoBack = () => {
    if (fromMarketplace) {
      navigate(fromMarketplace);
    } else {
      navigate(`/${language}/admin/tips`);
    }
  };

  const handleSaveTip = async (data: TipFormData) => {
    try {
      if (isNewTip) {
        const created = await createTip({
          title: data.title,
          description: data.description,
          is_active: data.isActive,
        });
        navigate(`/${language}/admin/tips/${created.id}`, { replace: true });
        toast({ description: "Tip created" });
      } else if (tip) {
        const updated = await updateTip(tip.id, {
          title: data.title,
          description: data.description,
          is_active: data.isActive,
        });
        setTip(updated);
        form.reset(data);
        toast({ description: "Tip saved" });
      }
    } catch (error) {
      console.error("Failed to save tip:", error);
      toast({ description: "Failed to save tip", variant: "destructive" });
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
            <Lightbulb className="h-5 w-5" />
            <h1 className="text-xl font-bold">{isNewTip ? "New Tip" : "Edit Tip"}</h1>
          </div>
          {!isNewTip && (
            <Button variant="destructive" size="sm" onClick={handleDeleteTip}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Tip
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Base Tip Info */}
        <Card>
          <CardHeader>
            <CardTitle>Tip Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSaveTip)} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title (Default)</label>
                  <Input {...form.register("title")} placeholder="Enter tip title" />
                  {form.formState.errors.title && (
                    <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Default)</label>
                  <RichTextEditor
                    value={description}
                    onChange={(value) => form.setValue("description", value, { shouldDirty: true })}
                    placeholder="Enter tip description"
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
                    <label htmlFor="isActive" className="text-sm flex items-center gap-2">
                      {isActive ? (
                        <>
                          <Eye className="h-4 w-4" /> Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4" /> Inactive
                        </>
                      )}
                    </label>
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
                  {form.formState.isSubmitting ? "Saving..." : isNewTip ? "Create Tip" : "Save Tip"}
                </Button>
              </div>
            </form>
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
