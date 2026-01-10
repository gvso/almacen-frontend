import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderSuccessDialogProps {
  orderUrl: string | null;
  onClose: () => void;
}

export default function OrderSuccessDialog({
  orderUrl,
  onClose,
}: OrderSuccessDialogProps) {
  const [copied, setCopied] = useState(false);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleCopy = async () => {
    if (!orderUrl) return;
    
    try {
      // Try native share on mobile only
      if (isMobile && navigator.share) {
        await navigator.share({
          title: "My Order",
          url: orderUrl,
        });
        return;
      }
      
      // Use clipboard on desktop
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(orderUrl);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = orderUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Dialog open={!!orderUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Order Placed Successfully!</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
            <Share2 className="h-6 w-6 text-amber-600 shrink-0" />
            <p className="text-sm font-medium text-amber-800">
              Don't forget to share this link with your host.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={orderUrl || ""}
              className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm"
            />
            <Button size="icon" variant="outline" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button asChild>
              <Link to={orderUrl?.replace(window.location.origin, "") || "#"}>
                View Order
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
