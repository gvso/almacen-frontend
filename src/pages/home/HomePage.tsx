import { ProductGrid, useProducts } from "@/features/products";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import { ErrorAlert } from "@/components/Alert";

export default function HomePage() {
  const { data, isLoading, isError } = useProducts();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-xl font-medium text-foreground">Products</h1>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {isError && (
          <ErrorAlert message="Failed to load products. Please try again later." />
        )}

        {data?.data && <ProductGrid products={data.data} />}
      </main>
    </div>
  );
}
