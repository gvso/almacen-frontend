import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { ProductGrid, ServiceGrid, useProducts } from "@/features/products";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import { ErrorAlert, InfoAlert, WarningAlert } from "@/components/Alert";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import type { ProductType } from "@/types/Product";

export default function ProductPage() {
  const { itemType } = useParams<{ itemType: string }>();
  const productType: ProductType = itemType === "services" ? "service" : "product";
  const isService = productType === "service";
  const translationKey = isService ? "service" : "product";

  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const { data, isLoading, isError } = useProducts({
    search: debouncedSearch || undefined,
    type: productType,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <InfoAlert
          title={t("payment.bannerTitle")}
          message={t("payment.bannerMessage")}
          className="mb-4"
        />
        <WarningAlert
          message={t(`${translationKey}.advanceNotice`)}
          className="mb-6"
        />

        <div className="relative mb-10">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t(`${translationKey}.searchPlaceholder`)}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-14 pl-10 sm:h-10"
          />
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {isError && (
          <ErrorAlert message={t(`${translationKey}.loadError`)} />
        )}

        {data?.data && (
          isService
            ? <ServiceGrid services={data.data} />
            : <ProductGrid products={data.data} />
        )}
      </main>
    </div>
  );
}
