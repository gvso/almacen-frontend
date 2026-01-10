import { useTranslation } from "react-i18next";
import { ProductGrid, useProducts } from "@/features/products";
import Navbar from "@/components/Navbar";
import PageTitle from "@/components/PageTitle";
import Spinner from "@/components/Spinner";
import { ErrorAlert } from "@/components/Alert";

export default function ProductPage() {
  const { data, isLoading, isError } = useProducts();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <PageTitle>{t("product.title")}</PageTitle>

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
