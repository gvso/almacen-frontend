import { useTranslation } from "react-i18next";
import { Product } from "@/types/Product";
import { HousekeepingCard } from "./HousekeepingCard";

interface HousekeepingGridProps {
  services: Product[];
}

export function HousekeepingGrid({ services }: HousekeepingGridProps) {
  const { t } = useTranslation();

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">{t("housekeeping.empty", "No services available")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <HousekeepingCard key={service.id} service={service} />
      ))}
    </div>
  );
}
