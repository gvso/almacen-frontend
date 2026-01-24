import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Lightbulb, Plus, Trash2, Save, Languages, GripVertical, Eye, EyeOff } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  fetchAdminTips,
  createTip,
  updateTip,
  deleteTip,
  createOrUpdateTipTranslation,
  deleteTipTranslation,
  reorderTips,
  verifyAdminToken,
} from "@/services/admin";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AdminTip } from "@/types/Tip";

const SUPPORTED_LANGUAGES = ["en", "es"];

const tipSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

const translationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

type TipFormData = z.infer<typeof tipSchema>;
type TranslationFormData = z.infer<typeof translationSchema>;

export default function AdminTipsPage() {
  const [tips, setTips] = useState<AdminTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [editingTipId, setEditingTipId] = useState<number | null>(null);
  const [showNewTipForm, setShowNewTipForm] = useState(false);
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

  const loadTips = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchAdminTips();
      setTips(response.data);
    } catch (error) {
      console.error("Failed to load tips:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isCheckingAuth) {
      loadTips();
    }
  }, [isCheckingAuth, loadTips]);

  const handleCreateTip = async (data: TipFormData) => {
    try {
      const newTip = await createTip({
        title: data.title,
        description: data.description,
      });
      setTips([...tips, newTip]);
      setShowNewTipForm(false);
    } catch (error) {
      console.error("Failed to create tip:", error);
    }
  };

  const handleUpdateTip = async (tipId: number, data: Partial<TipFormData & { is_active?: boolean }>) => {
    try {
      const updated = await updateTip(tipId, data);
      setTips(tips.map((t) => (t.id === tipId ? updated : t)));
      setEditingTipId(null);
    } catch (error) {
      console.error("Failed to update tip:", error);
    }
  };

  const handleDeleteTip = async (tipId: number, tipTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${tipTitle}"?`)) {
      return;
    }
    try {
      await deleteTip(tipId);
      setTips(tips.filter((t) => t.id !== tipId));
    } catch (error) {
      console.error("Failed to delete tip:", error);
    }
  };

  const handleSaveTranslation = async (tipId: number, lang: string, data: TranslationFormData) => {
    try {
      const updated = await createOrUpdateTipTranslation(tipId, {
        language: lang,
        title: data.title,
        description: data.description,
      });
      setTips(tips.map((t) => (t.id === tipId ? updated : t)));
    } catch (error) {
      console.error("Failed to save translation:", error);
    }
  };

  const handleDeleteTranslation = async (tipId: number, lang: string) => {
    try {
      const updated = await deleteTipTranslation(tipId, lang);
      setTips(tips.map((t) => (t.id === tipId ? updated : t)));
    } catch (error) {
      console.error("Failed to delete translation:", error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tips.findIndex((t) => t.id === active.id);
      const newIndex = tips.findIndex((t) => t.id === over.id);

      const newTips = arrayMove(tips, oldIndex, newIndex);
      setTips(newTips);

      try {
        const items = newTips.map((t, index) => ({ id: t.id, order: index }));
        await reorderTips(items);
      } catch (error) {
        console.error("Failed to save order:", error);
        loadTips();
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
            <Lightbulb className="h-5 w-5" />
            <h1 className="text-xl font-bold">Guide Tips</h1>
          </div>
          <Button onClick={() => setShowNewTipForm(true)} disabled={showNewTipForm} className="bg-action text-action-foreground hover:bg-action/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Tip
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-4">
        {showNewTipForm && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-lg">New Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <NewTipForm
                onSave={handleCreateTip}
                onCancel={() => setShowNewTipForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tips.length === 0 && !showNewTipForm ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No tips yet. Click "Add Tip" to create one.
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tips.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {tips.map((tip) => (
                  <SortableTipCard
                    key={tip.id}
                    tip={tip}
                    isEditing={editingTipId === tip.id}
                    onEdit={() => setEditingTipId(tip.id)}
                    onCancelEdit={() => setEditingTipId(null)}
                    onUpdate={(data) => handleUpdateTip(tip.id, data)}
                    onDelete={() => handleDeleteTip(tip.id, tip.title)}
                    onSaveTranslation={(lang, data) => handleSaveTranslation(tip.id, lang, data)}
                    onDeleteTranslation={(lang) => handleDeleteTranslation(tip.id, lang)}
                    onToggleActive={() => handleUpdateTip(tip.id, { is_active: !tip.isActive })}
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

// ============ Sub-components ============

interface NewTipFormProps {
  onSave: (data: TipFormData) => void;
  onCancel: () => void;
}

function NewTipForm({ onSave, onCancel }: NewTipFormProps) {
  const form = useForm<TipFormData>({
    resolver: zodResolver(tipSchema),
    defaultValues: { title: "", description: "" },
  });

  const description = form.watch("description");

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input {...form.register("title")} placeholder="Enter tip title" autoFocus />
          {form.formState.errors.title && (
            <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <RichTextEditor
            value={description}
            onChange={(value) => form.setValue("description", value, { shouldDirty: true })}
            placeholder="Enter tip description"
          />
          {form.formState.errors.description && (
            <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting} className="bg-action text-action-foreground hover:bg-action/90">
          <Save className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>
    </form>
  );
}

interface TipCardProps {
  tip: AdminTip;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (data: Partial<TipFormData>) => void;
  onDelete: () => void;
  onSaveTranslation: (lang: string, data: TranslationFormData) => void;
  onDeleteTranslation: (lang: string) => void;
  onToggleActive: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement> & { ref?: React.Ref<HTMLButtonElement> };
}

function SortableTipCard(props: Omit<TipCardProps, "dragHandleProps">) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.tip.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
      <TipCard {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

function TipCard({
  tip,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onSaveTranslation,
  onDeleteTranslation,
  onToggleActive,
  dragHandleProps,
}: TipCardProps) {
  const [showTranslations, setShowTranslations] = useState(false);
  const hasTranslations = tip.translations && tip.translations.length > 0;

  const form = useForm<TipFormData>({
    resolver: zodResolver(tipSchema),
    defaultValues: { title: tip.title, description: tip.description },
  });

  const description = form.watch("description");

  const handleSubmit = (data: TipFormData) => {
    onUpdate(data);
  };

  return (
    <Card className={!tip.isActive ? "opacity-60" : ""}>
      <CardContent className="p-4">
        {isEditing ? (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input {...form.register("title")} autoFocus />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <RichTextEditor
                  value={description}
                  onChange={(value) => form.setValue("description", value, { shouldDirty: true })}
                  placeholder="Enter tip description"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" onClick={onCancelEdit}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-action text-action-foreground hover:bg-action/90">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-start gap-4">
            {dragHandleProps && (
              <button
                type="button"
                className="cursor-grab active:cursor-grabbing touch-none p-1 text-muted-foreground hover:text-foreground mt-1"
                {...dragHandleProps}
              >
                <GripVertical className="h-5 w-5" />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{tip.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{tip.description}</p>
              {hasTranslations && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded mt-2 inline-block">
                  {tip.translations.length} translation(s)
                </span>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleActive}
                title={tip.isActive ? "Deactivate" : "Activate"}
              >
                {tip.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant={showTranslations ? "secondary" : "ghost"}
                onClick={() => setShowTranslations(!showTranslations)}
              >
                <Languages className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={onEdit}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {showTranslations && !isEditing && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Translations</p>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const existing = tip.translations?.find((t) => t.language === lang);
              return (
                <TipTranslationForm
                  key={`${tip.id}-${lang}`}
                  language={lang}
                  initialTitle={existing?.title || ""}
                  initialDescription={existing?.description || ""}
                  onSave={(data) => onSaveTranslation(lang, data)}
                  onDelete={existing ? () => onDeleteTranslation(lang) : undefined}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TipTranslationFormProps {
  language: string;
  initialTitle: string;
  initialDescription: string;
  onSave: (data: TranslationFormData) => void;
  onDelete?: () => void;
}

function TipTranslationForm({ language, initialTitle, initialDescription, onSave, onDelete }: TipTranslationFormProps) {
  const form = useForm<TranslationFormData>({
    resolver: zodResolver(translationSchema),
    defaultValues: { title: initialTitle, description: initialDescription },
  });

  const description = form.watch("description");

  return (
    <div className="space-y-2 p-3 bg-muted/50 rounded-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium uppercase">{language}</span>
        <div className="flex gap-2">
          {form.formState.isDirty && (
            <Button size="sm" variant="outline" onClick={form.handleSubmit(onSave)}>
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <Input {...form.register("title")} placeholder="Translated title" className="mb-2" />
      <RichTextEditor
        value={description}
        onChange={(value) => form.setValue("description", value, { shouldDirty: true })}
        placeholder="Translated description"
      />
    </div>
  );
}
