import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tip } from "@/types/Tip";

const STICKY_STYLES = [
  { bg: "bg-yellow-100", shadow: "shadow-yellow-200/50", rotate: "-rotate-1" },
  { bg: "bg-pink-100", shadow: "shadow-pink-200/50", rotate: "rotate-1" },
  { bg: "bg-blue-100", shadow: "shadow-blue-200/50", rotate: "-rotate-2" },
  { bg: "bg-green-100", shadow: "shadow-green-200/50", rotate: "rotate-2" },
  { bg: "bg-orange-100", shadow: "shadow-orange-200/50", rotate: "-rotate-1" },
  { bg: "bg-purple-100", shadow: "shadow-purple-200/50", rotate: "rotate-1" },
];

interface TipCardProps {
  tip: Tip;
  colorIndex: number;
  isAdmin?: boolean;
  onEdit?: () => void;
}

export function TipCard({ tip, colorIndex, isAdmin = false, onEdit }: TipCardProps) {
  const style = STICKY_STYLES[colorIndex % STICKY_STYLES.length];

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  return (
    <div
      className={`
        ${style.bg} ${style.rotate}
        relative p-16 aspect-square w-full max-w-[300px] md:max-w-none mx-auto lg:max-w-[350px] lg:max-h-[350px]
        shadow-lg lg:hover:shadow-xl
        transition-all duration-300 
        lg:hover:-translate-y-2 lg:hover:rotate-0
        cursor-default
      `}
      style={{
        // Realistic sticky note shape - slightly imperfect square
        clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
      }}
    >
      {/* Admin edit button */}
      {isAdmin && onEdit && (
        <Button
          size="icon"
          className="absolute top-2 left-2 z-10 h-8 w-8 bg-action text-action-foreground hover:bg-action/90 opacity-70 hover:opacity-100"
          onClick={handleEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      {/* Top edge shadow/fold effect */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-linear-to-b from-black/5 to-transparent"
      />

      {/* Corner fold effect */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4"
        style={{
          background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.08) 50%)",
        }}
      />

      {/* Pushpin at top-right */}
      <div className="absolute top-2 right-3">
        {/* Pin shadow */}
        <div className="absolute top-1 left-0.5 w-4 h-4 rounded-full bg-black/20 blur-[1px]" />
        {/* Pin head */}
        <div
          className="relative w-4 h-4 rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, #ef4444 0%, #b91c1c 60%, #7f1d1d 100%)",
            boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.3)",
          }}
        >
          {/* Highlight */}
          <div className="absolute top-0.5 left-1 w-1.5 h-1 rounded-full bg-white/40" />
        </div>
      </div>

      <div>
        <h3 className="font-bold text-base mb-3 text-gray-800 leading-tight">{tip.title}</h3>
        <div
          className="text-gray-600 text-sm leading-relaxed prose prose-sm prose-stone max-w-none [&_a]:text-blue-600 [&_a]:underline [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_p]:my-1"
          dangerouslySetInnerHTML={{ __html: tip.description }}
        />
      </div>
    </div>
  );
}
