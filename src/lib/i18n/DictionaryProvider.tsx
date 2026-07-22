"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Locale } from "./config";
import { i18n } from "./config";

type Dictionary = Record<string, any>; // Define properly based on your JSON structure

interface I18nContextType {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function DictionaryProvider({
  children,
  initialLocale,
  initialDictionary,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  initialDictionary: Dictionary;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = (newLocale: Locale) => {
    // Set cookie for server-side reading
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setLocaleState(newLocale);
    // Reload to let server components fetch the new dictionary
    window.location.reload();
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = initialDictionary;
    for (const k of keys) {
      if (value === undefined) break;
      value = value[k];
    }
    return value || key;
  };

  return (
    <I18nContext.Provider value={{ locale, dictionary: initialDictionary, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within a DictionaryProvider");
  }
  return context;
}
