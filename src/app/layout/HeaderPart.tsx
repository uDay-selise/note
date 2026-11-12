// Ported by Studio from the agreed design .studio/designs/parts/header.html, at the start of a build.
// Its markup, classes and CSS are the design's: wire real data, translation keys, routes and SDK
// actions into it and change nothing visual. Studio writes it again only when the design is redrawn;
// then `git diff` shows what to carry over.
import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { ThemeSwitch } from "./ThemeSwitch";
import "./HeaderPart.css";

export type HeaderPerson = { initials: string; name: string; role: string };

export function HeaderPart({ onNavigate, onSignOut, person }: { onNavigate?: (path: string) => void; onSignOut?: () => void; person: HeaderPerson }) {
  const { t } = useT();
  const rootRef = useRef<HTMLDivElement>(null);
  const goTo = (path: string) => (event: MouseEvent) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(path);
  };

  // Menus close on Escape, on a click outside and after choosing an item.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    function closeAll() {
      root?.querySelectorAll<HTMLDetailsElement>("details.ds-menu[open]").forEach((menu) => {
        menu.open = false;
      });
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeAll();
    }
    function onPointer(event: PointerEvent) {
      const target = event.target as Node | null;
      root?.querySelectorAll<HTMLDetailsElement>("details.ds-menu[open]").forEach((menu) => {
        if (target && !menu.contains(target)) menu.open = false;
      });
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  function choose(action: () => void) {
    if (rootRef.current) {
      rootRef.current.querySelectorAll<HTMLDetailsElement>("details.ds-menu[open]").forEach((menu) => {
        menu.open = false;
      });
    }
    action();
  }

  function signOut(event: MouseEvent) {
    event.preventDefault();
    choose(() => onSignOut?.());
  }

  return (
    <div className="studio-part-header" data-part-root="header" style={{ display: "contents" }} ref={rootRef}>
      <header style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--card) / 0.72)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", position: "sticky", top: "0", zIndex: "20" }}>
        <div className="ds-bar th-bar">
          <details className="ds-menu ds-only-narrow th-narrow-menu">
            <summary className="ds-menu-button" aria-label={t("header.menu")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </summary>
            <div className="ds-menu-list">
              <a href="/lists" data-goto="lists" onClick={goTo("/lists")}>{t("header.myLists")}</a>
              <ThemeSwitch />
              <div className="ds-user">
                <span className="ds-avatar">{person.initials}</span>
                {" "}
                <span className="ds-user-text">
                  {" "}
                  <b className="ds-user-name">{person.name}</b>
                  {" "}
                  <span className="ds-user-role">{person.role}</span>
                  {" "}
                </span>
              </div>
              <a href="/" className="th-narrow-signout" data-goto="welcome" onClick={signOut}>{t("header.signOut")}</a>
            </div>
          </details>
          <a href="/lists" className="th-brand" data-goto="lists" onClick={goTo("/lists")}>
            {" "}
            <span className="th-mark" aria-hidden="true">
              {" "}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M4 7h10M4 12h10M4 17h6" />
                <path d="m15.5 15.5 2 2 4-4.5" />
              </svg>
              {" "}
            </span>
            {" "}
            <span className="ds-brand-text">{t("welcome.brand")}</span>
            {" "}
          </a>
          <nav className="ds-nav th-nav ds-only-wide" aria-label={t("header.sections")}>
            <a href="/lists" className="ds-nav-item ds-active" data-goto="lists" onClick={goTo("/lists")}>{t("header.myLists")}</a>
          </nav>
          <span className="ds-spacer" />
          <ThemeSwitch className="ds-only-wide" />
          <details className="ds-menu ds-menu-left th-user">
            <summary className="th-user-btn" aria-label={t("header.accountMenuFor", { name: person.name })}>
              <span className="ds-avatar">{person.initials}</span>
              {" "}
              <span className="th-name">{person.name}</span>
              {" "}
              <svg className="th-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="ds-menu-list th-account">
              <div className="th-account-head">
                <span className="ds-avatar">{person.initials}</span>
                {" "}
                <span className="th-account-text">
                  {" "}
                  <b>{person.name}</b>
                  {" "}
                  <span>{person.role}</span>
                  {" "}
                </span>
              </div>
              <a href="/" data-goto="welcome" onClick={signOut}>{t("header.signOut")}</a>
            </div>
          </details>
        </div>
      </header>
    </div>
  );
}
