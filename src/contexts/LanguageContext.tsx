import { createContext, useContext } from "react";

export const SUPPORTED_LANGUAGES = ["en", "es"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";

export function isValidLanguage(lang: string): lang is Language {
  return SUPPORTED_LANGUAGES.includes(lang as Language);
}

interface LanguageContextValue {
  language: Language;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  language,
  children,
}: {
  language: Language;
  children: React.ReactNode;
}) {
  return (
    <LanguageContext.Provider value={{ language }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): Language {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context.language;
}
