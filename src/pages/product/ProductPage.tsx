import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { ProductGrid, ServiceGrid, HousekeepingGrid, useProducts } from "@/features/products";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import { ErrorAlert, InfoAlert, WarningAlert } from "@/components/Alert";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import type { ProductType } from "@/types/Product";

// Map routes to product types for API calls
const routeToProductType: Record<string, ProductType> = {
  "fridge-stocking": "product",
  "celebration": "service",
  "housekeeping": "housekeeping",
};

// Map routes to translation keys
const routeToTranslationKey: Record<string, string> = {
  "fridge-stocking": "fridgeStocking",
  "celebration": "celebration",
  "housekeeping": "housekeeping",
};

export default function ProductPage() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const currentRoute = pathSegments[pathSegments.length - 1] || "fridge-stocking";

  const productType = routeToProductType[currentRoute] || "product";
  const translationKey = routeToTranslationKey[currentRoute] || "fridgeStocking";
  const showSearch = currentRoute === "fridge-stocking";

  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const { data, isLoading, isError } = useProducts({
    search: debouncedSearch || undefined,
    type: productType,
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-amber-50/30">
      <Navbar />

      {/* Hero Section - matching home page style */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-stone-800 md:text-4xl lg:text-5xl">
              {t(`${translationKey}.title`)}
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-stone-600">
              {t(`${translationKey}.description`)}
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-16">
        <InfoAlert
          title={t("payment.bannerTitle")}
          message={t("payment.bannerMessage")}
          className="mb-4"
        />
        <WarningAlert
          message={t(`${translationKey}.advanceNotice`)}
          className="mb-8"
        />

        {showSearch && (
          <div className="relative mb-10">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t(`${translationKey}.searchPlaceholder`)}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-14 pl-10 sm:h-10 bg-white"
            />
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {isError && (
          <ErrorAlert message={t(`${translationKey}.loadError`)} />
        )}

        {data?.data && (
          currentRoute === "celebration" ? (
            <ServiceGrid services={data.data} />
          ) : currentRoute === "housekeeping" ? (
            <HousekeepingGrid services={data.data} />
          ) : (
            <ProductGrid products={data.data} />
          )
        )}
      </main>
    </div>
  );
}
