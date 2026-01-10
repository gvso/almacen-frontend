import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/toaster";

import HomePage from "@/pages/home/HomePage";
import CartPage from "@/pages/cart/CartPage";
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
          <Route path="/" element={<Navigate to={`/${DEFAULT_LANGUAGE}/products`} replace />} />
          
          {/* Language-prefixed routes */}
          <Route path="/:lang" element={<LanguageLayout />}>
            <Route path="products" element={<HomePage />} />
            <Route path="cart" element={<CartPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
