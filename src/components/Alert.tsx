import { AlertCircle, AlertTriangle, Info } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ErrorAlert({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function InfoAlert({
  title,
  message,
  className,
}: {
  title?: string;
  message: string;
  className?: string;
}) {
  return (
    <Alert variant="info" className={className}>
      <Info className="h-4 w-4" />
      {title && <AlertTitle className="text-base font-semibold">{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function WarningAlert({
  title,
  message,
  className,
}: {
  title?: string;
  message: string;
  className?: string;
}) {
  return (
    <Alert variant="warning" className={className}>
      <AlertTriangle className="h-4 w-4" />
      {title && <AlertTitle className="text-base font-semibold">{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
