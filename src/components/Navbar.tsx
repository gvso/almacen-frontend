import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Refrigerator, PartyPopper, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/features/cart";
import { useLanguage } from "@/contexts/LanguageContext";

function Navbar() {
  const { t } = useTranslation();
  const { itemCount } = useCart();
  const language = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.includes(path);

  const navItems = [
    { path: "fridge-stocking", labelKey: "nav.fridgeStocking", icon: Refrigerator },
    { path: "celebration", labelKey: "nav.celebration", icon: PartyPopper },
    { path: "housekeeping", labelKey: "nav.housekeeping", icon: Sparkles },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to={`/${language}`} className="font-serif text-xl font-medium text-stone-800 hover:text-stone-600 transition-colors">
            Meet Asunción
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, labelKey, icon: Icon }) => (
              <Button
                key={path}
                variant={isActive(`/${path}`) ? "default" : "ghost"}
                size="sm"
                className="text-sm gap-2"
                asChild
              >
                <Link to={`/${language}/${path}`}>
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{t(labelKey)}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile nav icons */}
          <div className="flex md:hidden items-center gap-1">
            {navItems.map(({ path, icon: Icon }) => (
              <Button
                key={path}
                variant={isActive(`/${path}`) ? "default" : "ghost"}
                size="sm"
                className="h-9 w-9 p-0"
                asChild
              >
                <Link to={`/${language}/${path}`}>
                  <Icon className="h-5 w-5" />
                </Link>
              </Button>
            ))}
          </div>

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
