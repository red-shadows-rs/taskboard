"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import type { ReactNode } from "react";
import type { Language } from "@/types";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

interface TranslationValue {
  [key: string]: string | TranslationValue;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

function setDeep(obj: TranslationValue, path: string, value: TranslationValue) {
  const keys = path.split("/");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (typeof current[key] !== "object" || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as TranslationValue;
  }

  const lastKey = keys[keys.length - 1];

  if (
    current[lastKey] &&
    typeof current[lastKey] === "object" &&
    value &&
    typeof value === "object"
  ) {
    current[lastKey] = { ...(current[lastKey] as TranslationValue), ...value };
  } else {
    current[lastKey] = value;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Language;
      if (saved && (saved === "en" || saved === "ar")) {
        return saved;
      }
    }
    return "en";
  });

  const [translationsState, setTranslationsState] = useState<
    Record<Language, TranslationValue>
  >({
    en: {},
    ar: {},
  });

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch("/api/locales");
        const modules: string[] = await response.json();

        const pathsToLoad =
          Array.isArray(modules) && modules.length > 0
            ? modules
            : [
                "dashboard/analytics",
                "dashboard/projects",
                "dashboard/tasks",
                "dashboard/team",
                "dashboard",
                "auth",
                "profile",
                "common",
              ];

        const enTranslations: TranslationValue = {};
        const arTranslations: TranslationValue = {};

        await Promise.all(
          pathsToLoad.map(async (path) => {
            try {
              const enRes = await fetch(`/locales/${path}/enLocale.json`);
              if (enRes.ok) {
                const enData = await enRes.json();
                setDeep(enTranslations, path, enData);
              }

              const arRes = await fetch(`/locales/${path}/arLocale.json`);
              if (arRes.ok) {
                const arData = await arRes.json();
                setDeep(arTranslations, path, arData);
              }
            } catch (_err) {}
          }),
        );

        setTranslationsState({ en: enTranslations, ar: arTranslations });
        setIsLoaded(true);
      } catch (_error) {
        setIsLoaded(true);
      }
    };

    loadTranslations();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    document.cookie = `language=${lang};path=/;max-age=31536000`;

    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  const t = useCallback(
    (key: string): string => {
      if (!isLoaded) return "";

      const keys = key.split(".");
      let value: string | TranslationValue = translationsState[language];

      for (const k of keys) {
        if (value && typeof value === "object") {
          value = value[k];
        } else {
          return key;
        }
      }

      return typeof value === "string" ? value : key;
    },
    [isLoaded, translationsState, language],
  );

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.cookie = `language=${language};path=/;max-age=31536000`;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
