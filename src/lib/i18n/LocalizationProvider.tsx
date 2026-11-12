import { createContext, useContext, useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { blocksClient } from "../blocks/client";
import { defaultDictionary } from "./dictionary";
import { appLanguages } from "./languages";
import type { TranslationKey } from "./dictionary";

type Dictionary = Record<string, string>;
export type LocalizationLanguage = { code: string; isDefault: boolean; name: string };
type LocalizationValue = {
  language: string;
  languages: LocalizationLanguage[];
  setLanguage: (language: string) => void;
  t: (key: TranslationKey, values?: string | Record<string, string | number>) => string;
};

const LocalizationContext = createContext<LocalizationValue | undefined>(undefined);
const LANGUAGE_KEY = "blocks-app:language";
// One module per screen would keep the initial payload small, but this
// This app's words live in its own translation module.
const MODULES = ["app-3b0164d5"];

function normalizeLanguage(raw: Record<string, unknown>): LocalizationLanguage {
  const code = raw.languageCode ?? raw.code ?? raw.culture ?? "en";
  const name = raw.languageName ?? raw.displayName ?? raw.name ?? String(code);
  return { code: String(code), isDefault: Boolean(raw.isDefault), name: String(name) };
}

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [languageOverride, setLanguageOverride] = useState(() => localStorage.getItem(LANGUAGE_KEY) ?? "");

  const languagesQuery = useQuery({
    queryFn: () => blocksClient.localization.languages(),
    queryKey: ["i18n", "languages"],
    staleTime: 5 * 60_000
  });

  const languages = useMemo(() => (Array.isArray(languagesQuery.data) ? languagesQuery.data : []).map(normalizeLanguage), [languagesQuery.data]);
  const offered = useMemo(() => (languages.length ? appLanguages.filter((entry) => languages.some((languageEntry) => languageEntry.code === entry.code)) : appLanguages), [languages]);
  // Until /Language/Gets resolves (or on a tenant with none configured), fall
  // back to "en" -- it must still match a real languageCode for translations
  // to resolve, so this is a startup default rather than a guaranteed hit.
  const defaultLanguage = languages.find((entry) => entry.isDefault)?.code ?? languages[0]?.code ?? "en";
  const language = languageOverride || defaultLanguage;

  function setLanguage(next: string) {
    localStorage.setItem(LANGUAGE_KEY, next);
    setLanguageOverride(next);
  }

  // One cached query per module for the active language -- TanStack Query
  // dedupes/caches by queryKey, so switching languages (or remounting) never
  // re-fetches a (language, module) pair that's already in cache.
  const moduleQueries = useQueries({
    queries: MODULES.map((moduleName) => ({
      queryFn: () => blocksClient.localization.translations(moduleName, language),
      queryKey: ["i18n", "translations", language, moduleName],
      staleTime: 5 * 60_000
    }))
  });

  const cloudDictionary = useMemo<Dictionary>(() => {
    const merged: Dictionary = {};
    moduleQueries.forEach((query, index) => {
      for (const [key, value] of Object.entries(query.data ?? {})) {
        const appKey = key;
        merged[appKey] = value;
      }
    });
    return merged;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleQueries.map((query) => query.dataUpdatedAt).join()]);

  const value = useMemo<LocalizationValue>(() => ({
    language,
    languages: offered.map((entry) => ({ code: entry.code, isDefault: entry.code === defaultLanguage, name: entry.label })),
    setLanguage,
    t: (key, values) => {
      const cloud = cloudDictionary[key];
      const text = cloud && !cloud.trim().startsWith("[") ? cloud : defaultDictionary[key] ?? (typeof values === "string" ? values : undefined) ?? key;
      if (!values || typeof values === "string") return text;
      return Object.entries(values).reduce((out, [name, value]) => out.split(`{${name}}`).join(String(value)), text);
    }
  }), [cloudDictionary, defaultLanguage, language, offered]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useT() {
  const context = useContext(LocalizationContext);
  if (!context) throw new Error("useT must be used within LocalizationProvider");
  return context;
}
