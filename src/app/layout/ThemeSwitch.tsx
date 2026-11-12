import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { MouseEvent } from "react";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { applyTheme, storedTheme } from "../../lib/theme/applyTheme";
import type { ThemeMode } from "../../lib/theme/applyTheme";

const MODES: { mode: ThemeMode; key: "header.light" | "header.dark" | "header.auto"; icon: ReactNode }[] = [
  { mode: "light", key: "header.light", icon: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></> },
  { mode: "dark", key: "header.dark", icon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /> },
  { mode: "auto", key: "header.auto", icon: <><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" /></> }
];

export function ThemeSwitch({ className = "" }: { className?: string }) {
  const { t } = useT();
  const [mode, setMode] = useState<ThemeMode>(() => storedTheme());

  useEffect(() => {
    applyTheme(mode);
    localStorage.setItem("app:theme", mode);
    if (mode !== "auto") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("auto");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [mode]);

  function choose(event: MouseEvent, next: ThemeMode) {
    event.preventDefault();
    setMode(next);
  }

  return (
    <div className={`ds-theme-switch ${className}`.trim()} role="group" aria-label={t("header.colourMode")}>
      {MODES.map((entry) => (
        <button
          key={entry.mode}
          type="button"
          aria-label={t(entry.key)}
          aria-pressed={mode === entry.mode}
          onClick={(event) => choose(event, entry.mode)}
          className={mode === entry.mode ? "ds-active" : undefined}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">{entry.icon}</svg>
        </button>
      ))}
    </div>
  );
}
