import { useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_LANGUAGE,
  isValidLanguage,
  LanguageProvider,
} from "@/contexts/LanguageContext";
import ScrollToTop from "@/components/ScrollToTop";

export default function LanguageLayout() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  // Sync i18n language with URL
  useEffect(() => {
    if (lang && isValidLanguage(lang) && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  // If no language or invalid language, redirect to default
  if (!lang || !isValidLanguage(lang)) {
    return <Navigate to={`/${DEFAULT_LANGUAGE}/products`} replace />;
  }

  return (
    <LanguageProvider language={lang}>
      <ScrollToTop />
      <Outlet />
    </LanguageProvider>
  );
}
