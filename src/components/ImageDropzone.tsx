import { useCallback, useState } from "react";
import { Upload, X, Loader2, Package } from "lucide-react";
import { uploadImageToGCS } from "@/services/admin/documents";
import { Button } from "@/components/ui/button";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_MB = 10;

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  /** Compact mode for inline use (e.g., in variation rows) */
  compact?: boolean;
  /** Fallback image to display when value is empty (shown with reduced opacity) */
  fallbackImage?: string;
}

export function ImageDropzone({ value, onChange, className = "", compact = false, fallbackImage }: ImageDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Invalid file type. Please use JPEG, PNG, GIF, or WebP.";
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleUpload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        const publicUrl = await uploadImageToGCS(file);
        onChange(publicUrl);
      } catch (err) {
        console.error("Upload failed:", err);
        setError("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleUpload(file);
      }
    },
    [handleUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleUpload(file);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleUpload]
  );

  const handleClear = useCallback(() => {
    onChange("");
    setError(null);
  }, [onChange]);

  // Compact mode (for variations)
  if (compact) {
    return (
      <div className={`relative group ${className}`}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative aspect-square w-full overflow-hidden rounded-lg bg-muted
            transition-all cursor-pointer
            ${isDragOver ? "ring-2 ring-primary" : ""}
            ${isUploading ? "pointer-events-none opacity-60" : ""}
            ${!value ? "border-2 border-dashed border-muted-foreground/25 hover:border-primary/50" : ""}
          `}
        >
          <input
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
          ) : value ? (
            <>
              <img src={value} alt="Product" className="h-full w-full object-contain p-2" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : fallbackImage ? (
            <img src={fallbackImage} alt="Default" className="h-full w-full object-contain p-2 opacity-40" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
    );
  }

  // Full mode (for product main image)
  if (value) {
    return (
      <div className={`relative group ${className}`}>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
          <img src={value} alt="Product" className="h-full w-full object-contain p-2" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleClear}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show dropzone
  return (
    <div className={className}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex flex-col items-center justify-center gap-2 
          aspect-square w-full rounded-lg border-2 border-dashed bg-muted
          transition-colors cursor-pointer
          ${isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Drop image here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, GIF, WebP up to {MAX_SIZE_MB}MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}
