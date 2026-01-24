import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Refrigerator, PartyPopper, Sparkles, Menu, X, ChevronDown, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/services/cart";
import { useLanguage, SUPPORTED_LANGUAGES, type Language } from "@/contexts/LanguageContext";

function Navbar() {
  const { t, i18n } = useTranslation();
  const { itemCount } = useCart();
  const language = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname.includes(path);
  const isServiceActive = () => 
    isActive("/fridge-stocking") || isActive("/celebration") || isActive("/housekeeping");

  const switchLanguage = (newLang: Language) => {
    // Replace current language prefix with the new one
    const newPath = location.pathname.replace(`/${language}`, `/${newLang}`);
    i18n.changeLanguage(newLang);
    navigate(newPath);
  };

  const serviceItems = [
    { path: "fridge-stocking", labelKey: "nav.fridgeStocking", icon: Refrigerator },
    { path: "celebration", labelKey: "nav.celebration", icon: PartyPopper },
    { path: "housekeeping", labelKey: "nav.housekeeping", icon: Sparkles },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    setServicesOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 lg:gap-6">
          {/* Mobile hamburger menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-10 w-10 p-0"
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
          <div className="hidden lg:flex items-center gap-1">
            {/* Services dropdown */}
            <div ref={servicesRef} className="relative">
              <Button
                variant={isServiceActive() ? "default" : "ghost"}
                size="sm"
                className="text-sm gap-1"
                onClick={() => setServicesOpen(!servicesOpen)}
              >
                {t("nav.services")}
                <ChevronDown className={`h-4 w-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
              </Button>
              
              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border py-1 z-50">
                  {serviceItems.map(({ path, labelKey, icon: Icon }) => (
                    <Link
                      key={path}
                      to={`/${language}/${path}`}
                      onClick={handleNavClick}
                      className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                        isActive(`/${path}`)
                          ? "bg-primary/10 text-primary"
                          : "text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t(labelKey)}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Local Guide button */}
            <Button
              variant={isActive("/tips") ? "default" : "ghost"}
              size="sm"
              className="text-sm gap-2"
              asChild
            >
              <Link to={`/${language}/tips`}>
                <MapPin className="h-4 w-4" />
                {t("nav.localGuide")}
              </Link>
            </Button>
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
        <div className="lg:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {/* Services section */}
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 pt-2">
              {t("nav.services")}
            </div>
            {serviceItems.map(({ path, labelKey, icon: Icon }) => (
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
            
            {/* Divider */}
            <div className="border-t my-2" />
            
            {/* Local Guide */}
            <Link
              to={`/${language}/tips`}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/tips")
                  ? "bg-primary text-primary-foreground"
                  : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              <MapPin className="h-5 w-5" />
              <span className="font-medium">{t("nav.localGuide")}</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
