import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Refrigerator, PartyPopper, Sparkles, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/features/cart";
import { useLanguage, SUPPORTED_LANGUAGES, type Language } from "@/contexts/LanguageContext";

function Navbar() {
  const { t, i18n } = useTranslation();
  const { itemCount } = useCart();
  const language = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname.includes(path);

  const switchLanguage = (newLang: Language) => {
    // Replace current language prefix with the new one
    const newPath = location.pathname.replace(`/${language}`, `/${newLang}`);
    i18n.changeLanguage(newLang);
    navigate(newPath);
  };

  const navItems = [
    { path: "fridge-stocking", labelKey: "nav.fridgeStocking", icon: Refrigerator },
    { path: "celebration", labelKey: "nav.celebration", icon: PartyPopper },
    { path: "housekeeping", labelKey: "nav.housekeeping", icon: Sparkles },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-6">
          {/* Mobile hamburger menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-10 w-10 p-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>

          <Link
            to={`/${language}`}
            className="text-xl font-bold text-stone-800 hover:text-stone-600 transition-colors"
          >
            Meet Asunción
          </Link>

          {/* Desktop nav */}
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

        <div className="flex items-center gap-1">
          {/* Language switcher */}
          <div className="flex items-center">
            {SUPPORTED_LANGUAGES.map((lang, index) => (
              <span key={lang} className="flex items-center">
                <button
                  onClick={() => switchLanguage(lang)}
                  className={`px-1.5 py-1 text-sm font-medium uppercase transition-colors ${
                    language === lang
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang}
                </button>
                {index < SUPPORTED_LANGUAGES.length - 1 && (
                  <span className="text-muted-foreground">/</span>
                )}
              </span>
            ))}
          </div>

          {/* Cart button */}
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

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map(({ path, labelKey, icon: Icon }) => (
              <Link
                key={path}
                to={`/${language}/${path}`}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(`/${path}`)
                    ? "bg-primary text-primary-foreground"
                    : "text-stone-700 hover:bg-stone-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{t(labelKey)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
