import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { ProductGrid, useProducts } from "@/features/products";
import Navbar from "@/components/Navbar";
import PageTitle from "@/components/PageTitle";
import Spinner from "@/components/Spinner";
import { ErrorAlert, InfoAlert } from "@/components/Alert";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

export default function ProductPage() {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const { data, isLoading, isError } = useProducts({ search: debouncedSearch || undefined });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <PageTitle>{t("product.title")}</PageTitle>

        <InfoAlert
          title={t("payment.bannerTitle")}
          message={t("payment.bannerMessage")}
          className="mb-6"
        />

        <div className="relative mb-10">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("product.searchPlaceholder")}
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
          <ErrorAlert message={t("product.loadError")} />
        )}

        {data?.data && <ProductGrid products={data.data} />}
      </main>
    </div>
  );
}
