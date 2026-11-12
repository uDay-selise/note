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

// Exported for the build's checks: a value the service has no text for comes
// back as a marker like "[ KEY MISSING ]", and the app's own words must win.
export function pickText(cloud: string | undefined, fallback: string | undefined, key: string): string {
  if (cloud && !cloud.trim().startsWith("[")) return cloud;
  if (fallback && !fallback.trim().startsWith("[")) return fallback;
  return key;
}

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [languageOverride, setLanguageOverride] = useState(() => localStorage.getItem(LANGUAGE_KEY) ?? "");
  // The project's languages are the app's own fixed list; the service is
  // only asked for its default so a first visit knows where to start.
  const languagesQuery = useQuery({
    queryFn: () => blocksClient.localization.languages(),
    queryKey: ["i18n", "languages"],
    staleTime: 5 * 60_000
  });

  const serviceLanguages = useMemo(() => (Array.isArray(languagesQuery.data) ? languagesQuery.data : []), [languagesQuery.data]);
  const defaultLanguage = useMemo(() => {
    const serviceDefault = serviceLanguages.find((entry) => Boolean(entry?.isDefault))?.languageCode;
    if (appLanguages.some((entry) => entry.code === serviceDefault)) return String(serviceDefault);
    return appLanguages[0]?.code ?? "en-US";
  }, [serviceLanguages]);
  const storedOverride = appLanguages.some((entry) => entry.code === languageOverride) ? languageOverride : "";
  // No saved choice: follow the browser's language when the project has it.
  const browserMatch = appLanguages.find((entry) => entry.code.toLowerCase().split("-")[0] === navigator.language.toLowerCase().split("-")[0]);
  const language = storedOverride || browserMatch?.code || defaultLanguage;

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
    languages: appLanguages.map((entry) => ({ code: entry.code, isDefault: entry.code === defaultLanguage, name: entry.label })),
    setLanguage,
    t: (key, values) => {
      const text = pickText(cloudDictionary[key], defaultDictionary[key], typeof values === "string" ? values : key);
      if (!values || typeof values === "string") return text;
      return Object.entries(values).reduce((out, [name, value]) => out.split(`{${name}}`).join(String(value)), text);
    }
  }), [cloudDictionary, defaultLanguage, language]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useT() {
  const context = useContext(LocalizationContext);
  if (!context) throw new Error("useT must be used within LocalizationProvider");
  return context;
}
