"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  isLanguage,
  languageStorageKey,
  translatePhotoCategory,
  translateWishType,
  translate,
  type Language,
  type TranslationKey
} from "@/lib/i18n";
import type { PhotoCategory, WishType } from "@/lib/types";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  tPhotoCategory: (category: PhotoCategory) => string;
  tWishType: (type: WishType) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(languageStorageKey);
    if (isLanguage(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    function setLanguage(nextLanguage: Language) {
      setLanguageState(nextLanguage);
      window.localStorage.setItem(languageStorageKey, nextLanguage);
      document.documentElement.lang = nextLanguage;
    }

    return {
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === "en" ? "th" : "en"),
      t: (key) => translate(language, key),
      tPhotoCategory: (category) => translatePhotoCategory(language, category),
      tWishType: (type) => translateWishType(language, type)
    };
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
