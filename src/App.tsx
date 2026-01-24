import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/toaster";

import HomePage from "@/pages/home/HomePage";
import ProductPage from "@/pages/product/ProductPage";
import CartPage from "@/pages/cart/CartPage";
import OrderPage from "@/pages/order/OrderPage";
import TipsPage from "@/pages/tips/TipsPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminProductEditPage from "@/pages/admin/AdminProductEditPage";
import AdminTagsPage from "@/pages/admin/AdminTagsPage";
import AdminTipsPage from "@/pages/admin/AdminTipsPage";
import AdminTipEditPage from "@/pages/admin/AdminTipEditPage";
import LanguageLayout from "@/layouts/LanguageLayout";
import { DEFAULT_LANGUAGE } from "@/contexts/LanguageContext";
import { toCamelCase } from "./utils/casing";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      select: toCamelCase,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to default language */}
          <Route path="/" element={<Navigate to={`/${DEFAULT_LANGUAGE}`} replace />} />

          {/* Language-prefixed routes */}
          <Route path="/:lang" element={<LanguageLayout />}>
            <Route index element={<HomePage />} />
            <Route path="fridge-stocking" element={<ProductPage />} />
            <Route path="celebration" element={<ProductPage />} />
            <Route path="housekeeping" element={<ProductPage />} />
            <Route path="tips" element={<TipsPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="orders/:orderId" element={<OrderPage />} />

            {/* Legacy routes - redirect to new structure */}
            <Route path="products" element={<Navigate to="../fridge-stocking" replace />} />
            <Route path="services" element={<Navigate to="../celebration" replace />} />

            {/* Admin routes */}
            <Route path="admin" element={<AdminLoginPage />} />
            <Route path="admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="admin/orders" element={<AdminOrdersPage />} />
            <Route path="admin/tags" element={<AdminTagsPage />} />
            <Route path="admin/tips" element={<AdminTipsPage />} />
            <Route path="admin/tips/:tipId" element={<AdminTipEditPage />} />
            <Route path="admin/:itemType" element={<AdminProductsPage />} />
            <Route path="admin/:itemType/:productId" element={<AdminProductEditPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
