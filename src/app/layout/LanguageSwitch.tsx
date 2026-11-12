import { useId } from "react";
import { appLanguages } from "../../lib/i18n/languages";
import { useT } from "../../lib/i18n/LocalizationProvider";

export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { language, setLanguage, t } = useT();
  const id = useId();

  return (
    <div className={`ds-lang-switch ${className}`.trim()} role="group" aria-label={t("header.language")}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </svg>
      <select
        className="ds-lang-select"
        aria-label={t("header.language")}
        value={language}
        id={id}
        onChange={(event) => setLanguage(event.target.value)}
      >
        {appLanguages.map((entry) => (
          <option key={entry.code} value={entry.code}>{entry.label}</option>
        ))}
      </select>
    </div>
  );
}
