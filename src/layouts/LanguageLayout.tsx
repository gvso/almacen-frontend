import { Navigate, Outlet, useParams } from "react-router-dom";
import {
  DEFAULT_LANGUAGE,
  isValidLanguage,
  LanguageProvider,
} from "@/contexts/LanguageContext";

export default function LanguageLayout() {
  const { lang } = useParams<{ lang: string }>();

  // If no language or invalid language, redirect to default
  if (!lang || !isValidLanguage(lang)) {
    return <Navigate to={`/${DEFAULT_LANGUAGE}/products`} replace />;
  }

  return (
    <LanguageProvider language={lang}>
      <Outlet />
    </LanguageProvider>
  );
}
