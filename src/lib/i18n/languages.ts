export type AppLanguage = { code: string; label: string };

// The project's languages, written out here rather than read from the service at runtime.
export const appLanguages: AppLanguage[] = [
  { code: "en-US", label: "English" },
  { code: "bn-BD", label: "বাংলা" },
  { code: "de-DE", label: "Deutsch" },
  { code: "dz-BT", label: "ཇོང་ཁ" }
];
