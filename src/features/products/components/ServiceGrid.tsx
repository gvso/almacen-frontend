import { useTranslation } from "react-i18next";
import { Product } from "@/types/Product";
import { ServiceCard } from "./ServiceCard";

interface ServiceGridProps {
  services: Product[];
}

export function ServiceGrid({ services }: ServiceGridProps) {
  const { t } = useTranslation();

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">{t("service.empty", "No services available")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
