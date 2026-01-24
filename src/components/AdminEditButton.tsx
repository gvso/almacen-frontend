import { Pencil } from "lucide-react";

interface AdminEditButtonProps {
  onClick: () => void;
  /** Position the button absolutely in the top-left corner */
  absolute?: boolean;
  className?: string;
}

export function AdminEditButton({ onClick, absolute = false, className = "" }: AdminEditButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const baseStyles = "p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors";
  const absoluteStyles = absolute ? "absolute top-2 left-2 z-10 bg-white/80 backdrop-blur-sm shadow-sm" : "shrink-0";

  return (
    <button
      onClick={handleClick}
      className={`${baseStyles} ${absoluteStyles} ${className}`}
      title="Edit"
    >
      <Pencil className="h-4 w-4" />
    </button>
  );
}
