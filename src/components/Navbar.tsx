import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/features/cart";
import { useLanguage } from "@/contexts/LanguageContext";

function Navbar() {
  const { itemCount } = useCart();
  const language = useLanguage();
  const { t } = useTranslation();

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={`/${language}/products`} className="text-xl font-bold text-foreground">
          {t("navbar.catalog")}
        </Link>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="relative h-10 w-10 p-0 sm:h-9 sm:w-9" asChild>
            <Link to={`/${language}/cart`}>
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
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
