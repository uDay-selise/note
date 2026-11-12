// Ported by Studio from the agreed design .studio/designs/screens/welcome.html, at the start of a build.
// Its markup, classes and CSS are the design's: wire real data, translation keys, routes and SDK
// actions into it and change nothing visual. Studio writes it again only when the design is redrawn;
// then `git diff` shows what to carry over.
import type { MouseEvent } from "react";
import { LanguageSwitch } from "../../app/layout/LanguageSwitch";
import { ThemeSwitch } from "../../app/layout/ThemeSwitch";
import { useT } from "../../lib/i18n/LocalizationProvider";
import "./WelcomeScreen.css";

export type WelcomeScreenProps = {
  error?: string;
  onNavigate?: (path: string) => void;
  onSignIn?: () => void;
  signingIn?: boolean;
  signUpEnabled?: boolean;
};

export function WelcomeScreen({ error, onNavigate, onSignIn, signingIn, signUpEnabled = false }: WelcomeScreenProps) {
  const { t } = useT();
  const goTo = (path: string) => (event: MouseEvent) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(path);
  };
  return (
    <div className="studio-screen-welcome" style={{ display: "contents" }}>
      <main data-screen="welcome">
        <div className="wc-bar">
          <div className="ds-bar">
            <a href="/" className="wc-brand" data-goto="welcome" aria-label={t("welcome.home")} onClick={goTo("/")}> <span className="wc-mark" aria-hidden="true">{" "}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M5 13l4 4 10-10" /></svg>{" "}</span> {t("welcome.brand")} </a>
            <div className="wc-bar-actions">
              <ThemeSwitch />
              <LanguageSwitch className="wc-lang" />
            </div>
          </div>
        </div>
        <div className="wc-wrap">
          <div className="ds-page">
            <div className="wc-hero">
              <span className="ds-deco wc-deco-ring" aria-hidden="true" />
              {" "}
              <span className="ds-deco wc-deco-dot" aria-hidden="true" />
              <div className="wc-copy">
                <h1 className="wc-title">{t("welcome.title.a")}<br /><em>{t("welcome.title.b")}</em></h1>
                <p className="wc-lede"><b>{t("welcome.lede.b")}</b> {t("welcome.lede.rest")}</p>
                <div className="wc-cta">
                  <button className="ds-btn ds-btn-lg" type="button" disabled={signingIn} onClick={onSignIn}>{signUpEnabled ? t("welcome.signIn") : t("welcome.signInOnly")}</button>
                </div>
                {error ? <p className="ds-error" role="alert" style={{ margin: "calc(12px * var(--space-scale, 1)) 0 0" }}>{error}</p> : null}
                <p className="wc-hint">{signUpEnabled ? t("welcome.note") : t("welcome.noteSignInOnly")}</p>
                <ul className="wc-steps">
                  <li><span className="wc-step-dot" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h10" /></svg></span>{t("welcome.step.list")}</li>
                  <li><span className="wc-step-dot" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg></span>{t("welcome.step.add")}</li>
                  <li><span className="wc-step-dot" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4 10-10" /></svg></span>{t("welcome.step.tick")}</li>
                </ul>
              </div>
              <div className="wc-art" aria-hidden="true">
                <div className="wc-art-head">
                  <span className="wc-list-title">
                    {" "}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M4 6h16M4 12h16M4 18h10" />
                    </svg>
                    {" "}
                    <span>{t("welcome.preview.list")}</span>
                    {" "}
                  </span>
                  {" "}
                  <span className="ds-badge ds-badge-quiet">{t("welcome.preview.badge")}</span>
                </div>
                <div className="wc-tasks">
                  <div className="wc-task">
                    <span className="wc-box" />
                    {" "}
                    <span className="wc-task-name">{t("welcome.preview.task1")}</span>
                  </div>
                  <div className="wc-task">
                    <span className="wc-box" />
                    {" "}
                    <span className="wc-task-name">{t("welcome.preview.task2")}</span>
                  </div>
                  <div className="wc-task wc-task-done">
                    <span className="wc-box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 13l4 4 10-10" />
                      </svg>
                    </span>
                    {" "}
                    <span className="wc-task-name">{t("welcome.preview.task3")}</span>
                  </div>
                </div>
                <div className="wc-art-foot">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="14" height="14">
                    <path d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  {" "}
                  <span>{t("welcome.artFoot")}</span>
                </div>
              </div>
              <div className="wc-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8h.01M11 12h1v4h1" />
                </svg>
                {" "}
                <span>{t("welcome.note")}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
