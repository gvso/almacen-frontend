import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lightbulb, Plus, Trash2, Languages, GripVertical, Eye, EyeOff, Pencil, Building2 } from "lucide-react";
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
import {
  fetchAdminTips,
  updateTip,
  deleteTip,
  reorderTips,
  verifyAdminToken,
} from "@/services/admin";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AdminTip, TipType } from "@/types/Tip";

const TIP_TYPES: { value: TipType; label: string; icon: React.ReactNode }[] = [
  { value: "quick_tip", label: "Guide Tips", icon: <Lightbulb className="h-4 w-4" /> },
  { value: "business", label: "Businesses", icon: <Building2 className="h-4 w-4" /> },
];

export default function AdminTipsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tipType = (searchParams.get("type") as TipType) || "quick_tip";
  const [tips, setTips] = useState<AdminTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const language = useLanguage();

  const currentTypeConfig = TIP_TYPES.find((t) => t.value === tipType) || TIP_TYPES[0];

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
      const response = await fetchAdminTips(tipType);
      setTips(response.data);
    } catch (error) {
      console.error("Failed to load tips:", error);
    } finally {
      setIsLoading(false);
    }
  }, [tipType]);

  useEffect(() => {
    if (!isCheckingAuth) {
      loadTips();
    }
  }, [isCheckingAuth, loadTips]);

  const handleToggleActive = async (tipId: number, isActive: boolean) => {
    try {
      const updated = await updateTip(tipId, { is_active: !isActive });
      setTips(tips.map((t) => (t.id === tipId ? updated : t)));
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
            {currentTypeConfig.icon}
            <h1 className="text-xl font-bold">{currentTypeConfig.label}</h1>
          </div>
          <Button onClick={() => navigate(`/${language}/admin/tips/new?type=${tipType}`)} className="bg-action text-action-foreground hover:bg-action/90">
            <Plus className="h-4 w-4 mr-2" />
            Add {tipType === "business" ? "Business" : "Tip"}
          </Button>
        </div>
      </header>

      {/* Type Tabs */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            {TIP_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setSearchParams({ type: type.value })}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tipType === type.value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                {type.icon}
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tips.length === 0 ? (
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
                    onEdit={() => navigate(`/${language}/admin/tips/${tip.id}`)}
                    onDelete={() => handleDeleteTip(tip.id, tip.title)}
                    onToggleActive={() => handleToggleActive(tip.id, tip.isActive)}
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

interface TipCardProps {
  tip: AdminTip;
  onEdit: () => void;
  onDelete: () => void;
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
  onEdit,
  onDelete,
  onToggleActive,
  dragHandleProps,
}: TipCardProps) {
  const hasTranslations = tip.translations && tip.translations.length > 0;

  return (
    <Card className={!tip.isActive ? "opacity-60" : ""}>
      <CardContent className="p-4">
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
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <h3 className="font-medium truncate">{tip.title}</h3>
            {hasTranslations && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                <Languages className="h-3 w-3 inline mr-1" />
                {tip.translations.length}
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
            <Button size="sm" variant="ghost" onClick={onEdit} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={onDelete}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
