import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Tags, Plus, Trash2, Save, Languages, GripVertical } from "lucide-react";
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
import {
  fetchAdminTags,
  createTag,
  updateTag,
  deleteTag,
  createOrUpdateTagTranslation,
  deleteTagTranslation,
  reorderTags,
  verifyAdminToken,
} from "@/services/admin";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AdminTag } from "@/types/Tag";

const SUPPORTED_LANGUAGES = ["en", "es"];

const tagSchema = z.object({
    label: z.string().min(1, "Label is required"),
});

const translationSchema = z.object({
    label: z.string().min(1, "Label is required"),
});

type TagFormData = z.infer<typeof tagSchema>;
type TranslationFormData = z.infer<typeof translationSchema>;

export default function AdminTagsPage() {
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [showNewTagForm, setShowNewTagForm] = useState(false);
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

  const loadTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchAdminTags();
      setTags(response.data);
    } catch (error) {
      console.error("Failed to load tags:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isCheckingAuth) {
      loadTags();
    }
  }, [isCheckingAuth, loadTags]);

  const handleCreateTag = async (data: TagFormData) => {
    try {
      const newTag = await createTag({ label: data.label });
      setTags([...tags, newTag]);
      setShowNewTagForm(false);
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  const handleUpdateTag = async (tagId: number, data: TagFormData) => {
    try {
      const updated = await updateTag(tagId, { label: data.label });
      setTags(tags.map((t) => (t.id === tagId ? updated : t)));
      setEditingTagId(null);
    } catch (error) {
      console.error("Failed to update tag:", error);
    }
  };

  const handleDeleteTag = async (tagId: number, tagLabel: string) => {
    if (!window.confirm(`Are you sure you want to delete "${tagLabel}"? This will remove the tag from all products.`)) {
      return;
    }
    try {
      await deleteTag(tagId);
      setTags(tags.filter((t) => t.id !== tagId));
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  };

  const handleSaveTranslation = async (tagId: number, lang: string, data: TranslationFormData) => {
    try {
      const updated = await createOrUpdateTagTranslation(tagId, {
        language: lang,
        label: data.label,
      });
      setTags(tags.map((t) => (t.id === tagId ? updated : t)));
    } catch (error) {
      console.error("Failed to save translation:", error);
    }
  };

  const handleDeleteTranslation = async (tagId: number, lang: string) => {
    try {
      const updated = await deleteTagTranslation(tagId, lang);
      setTags(tags.map((t) => (t.id === tagId ? updated : t)));
    } catch (error) {
      console.error("Failed to delete translation:", error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tags.findIndex((t) => t.id === active.id);
      const newIndex = tags.findIndex((t) => t.id === over.id);

      const newTags = arrayMove(tags, oldIndex, newIndex);
      setTags(newTags);

      // Save new order to backend
      try {
        const items = newTags.map((t, index) => ({ id: t.id, order: index }));
        await reorderTags(items);
      } catch (error) {
        console.error("Failed to save order:", error);
        // Revert on error
        loadTags();
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
            <Tags className="h-5 w-5" />
            <h1 className="text-xl font-bold">Tags</h1>
          </div>
          <Button onClick={() => setShowNewTagForm(true)} disabled={showNewTagForm}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tag
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-4">
        {showNewTagForm && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-lg">New Tag</CardTitle>
            </CardHeader>
            <CardContent>
              <NewTagForm
                onSave={handleCreateTag}
                onCancel={() => setShowNewTagForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tags.length === 0 && !showNewTagForm ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No tags yet. Click "Add Tag" to create one.
            </CardContent>
          </Card>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={tags.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {tags.map((tag) => (
                          <SortableTagCard
                            key={tag.id}
                            tag={tag}
                            isEditing={editingTagId === tag.id}
                            onEdit={() => setEditingTagId(tag.id)}
                            onCancelEdit={() => setEditingTagId(null)}
                            onUpdate={(data) => handleUpdateTag(tag.id, data)}
                            onDelete={() => handleDeleteTag(tag.id, tag.label)}
                            onSaveTranslation={(lang, data) => handleSaveTranslation(tag.id, lang, data)}
                            onDeleteTranslation={(lang) => handleDeleteTranslation(tag.id, lang)}
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

interface NewTagFormProps {
  onSave: (data: TagFormData) => void;
  onCancel: () => void;
}

function NewTagForm({ onSave, onCancel }: NewTagFormProps) {
  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: { label: "" },
  });

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="flex gap-4 items-end">
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium">Label</label>
        <Input {...form.register("label")} placeholder="Enter tag label" autoFocus />
        {form.formState.errors.label && (
          <p className="text-xs text-destructive">{form.formState.errors.label.message}</p>
        )}
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        <Save className="h-4 w-4 mr-2" />
        Create
      </Button>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  );
}

interface TagCardProps {
  tag: AdminTag;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (data: TagFormData) => void;
  onDelete: () => void;
  onSaveTranslation: (lang: string, data: TranslationFormData) => void;
  onDeleteTranslation: (lang: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement> & { ref?: React.Ref<HTMLButtonElement> };
}

function SortableTagCard(props: Omit<TagCardProps, "dragHandleProps">) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.tag.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
      <TagCard {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

function TagCard({
  tag,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onSaveTranslation,
  onDeleteTranslation,
  dragHandleProps,
}: TagCardProps) {
  const [showTranslations, setShowTranslations] = useState(false);
  const hasTranslations = tag.translations && tag.translations.length > 0;

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: { label: tag.label },
  });

  const handleSubmit = (data: TagFormData) => {
    onUpdate(data);
  };

  return (
    <Card>
      <CardContent className="p-4">
        {isEditing ? (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex gap-4 items-center">
            <Input {...form.register("label")} className="flex-1" autoFocus />
            <Button type="submit" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancelEdit}>
              Cancel
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {dragHandleProps && (
                <button
                  type="button"
                  className="cursor-grab active:cursor-grabbing touch-none p-1 text-muted-foreground hover:text-foreground"
                  {...dragHandleProps}
                >
                  <GripVertical className="h-5 w-5" />
                </button>
              )}
              <span className="font-medium">{tag.label}</span>
              {hasTranslations && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {tag.translations.length} translation(s)
                </span>
              )}
            </div>
            <div className="flex gap-2">
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

        {showTranslations && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Translations</p>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const existing = tag.translations?.find((t) => t.language === lang);
              return (
                <TagTranslationForm
                  key={`${tag.id}-${lang}`}
                  language={lang}
                  initialLabel={existing?.label || ""}
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

interface TagTranslationFormProps {
  language: string;
  initialLabel: string;
  onSave: (data: TranslationFormData) => void;
  onDelete?: () => void;
}

function TagTranslationForm({ language, initialLabel, onSave, onDelete }: TagTranslationFormProps) {
  const form = useForm<TranslationFormData>({
    resolver: zodResolver(translationSchema),
    defaultValues: { label: initialLabel },
  });

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium uppercase w-8">{language}</span>
      <Input {...form.register("label")} placeholder="Translated label" className="flex-1" />
      {form.formState.isDirty && (
        <Button size="sm" variant="outline" onClick={form.handleSubmit(onSave)}>
          <Save className="h-3 w-3" />
        </Button>
      )}
      {onDelete && (
        <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
