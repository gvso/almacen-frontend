import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/features/cart";
import { useLanguage } from "@/contexts/LanguageContext";

function Navbar() {
  const { t } = useTranslation();
  const { itemCount } = useCart();
  const language = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to={`/${language}/products`} className="text-xl font-bold text-foreground">
            Concierge
          </Link>

          <div className="flex items-center gap-1">
            <Button
              variant={isActive("/products") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to={`/${language}/products`}>{t("nav.products")}</Link>
            </Button>
            <Button
              variant={isActive("/services") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to={`/${language}/services`}>{t("nav.services")}</Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant={isActive("/cart") ? "default" : "ghost"}
            className="relative h-10 w-10 p-0 sm:h-9 sm:w-9"
            asChild
          >
            <Link to={`/${language}/cart`}>
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && !isActive("/cart") && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
