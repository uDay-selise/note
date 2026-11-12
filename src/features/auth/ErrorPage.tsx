import { useT } from "../../lib/i18n/LocalizationProvider";
import { LanguageSwitch } from "../../app/layout/LanguageSwitch";
import { ThemeSwitch } from "../../app/layout/ThemeSwitch";

export function ErrorPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const { t } = useT();
  return (
    <section className="not-found">
      <div className="ds-corner"><LanguageSwitch /><ThemeSwitch /></div>
      <h2>{t("error.title")}</h2>
      <p>{t("error.detail")}</p>
      <button className="primary-button" type="button" onClick={() => onNavigate?.("/")}>{t("error.home")}</button>
    </section>
  );
}
