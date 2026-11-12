import { useT } from "../../lib/i18n/LocalizationProvider";

export function ErrorPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const { t } = useT();
  return (
    <section className="not-found">
      <h2>{t("lists.error.title")}</h2>
      <p>{t("lists.error.detail")}</p>
      <button className="primary-button" onClick={() => onNavigate?.("/")}>{t("notFound.home")}</button>
    </section>
  );
}
