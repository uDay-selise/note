// Ported by Studio from the agreed design .studio/designs/parts/header.html, at the start of a build.
// Its markup, classes and CSS are the design's: wire real data, translation keys, routes and SDK
// actions into it and change nothing visual. Studio writes it again only when the design is redrawn;
// then `git diff` shows what to carry over.
import type { MouseEvent } from "react";
import "./HeaderPart.css";

export function HeaderPart({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const goTo = (path: string) => (event: MouseEvent) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(path);
  };
  return (
    <div className="studio-part-header" data-part-root="header" style={{ display: "contents" }}>
      <header style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--card) / 0.72)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", position: "sticky", top: "0", zIndex: "20" }}>
        <div className="ds-bar th-bar">
          <details className="ds-menu ds-only-narrow th-narrow-menu">
            <summary className="ds-menu-button" aria-label="Open the menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </summary>
            <div className="ds-menu-list">
              <a href="/lists" data-goto="lists" onClick={goTo("/lists")}>My lists</a>
              <div className="ds-theme-switch" role="group" aria-label="Colour mode">
                <button aria-label="Light">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                  </svg>
                </button>
                {" "}
                <button aria-label="Dark">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
                  </svg>
                </button>
                {" "}
                <button className="ds-active" aria-label="Auto">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" />
                  </svg>
                </button>
              </div>
              <div className="ds-user">
                <span className="ds-avatar" data-sample="">PS</span>
                {" "}
                <span className="ds-user-text">
                  {" "}
                  <b className="ds-user-name" data-sample="me.name">Priya Shah</b>
                  {" "}
                  <span className="ds-user-role" data-sample="me.role">Signed in</span>
                  {" "}
                </span>
              </div>
              <a href="/" className="th-narrow-signout" data-goto="welcome" onClick={goTo("/")}>Sign out</a>
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
            <span className="ds-brand-text">thursday - 12/11/2026 app</span>
            {" "}
          </a>
          <nav className="ds-nav th-nav ds-only-wide" aria-label="Main sections">
            <a href="/lists" className="ds-nav-item ds-active" data-goto="lists" onClick={goTo("/lists")}>My lists</a>
          </nav>
          <span className="ds-spacer" />
          <div className="ds-theme-switch ds-only-wide" role="group" aria-label="Colour mode">
            <button aria-label="Light">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            </button>
            {" "}
            <button aria-label="Dark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
              </svg>
            </button>
            {" "}
            <button className="ds-active" aria-label="Auto">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="12" cy="12" r="8" />
                <path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" />
              </svg>
            </button>
          </div>
          <details className="ds-menu ds-menu-left th-user">
            <summary className="th-user-btn" aria-label="Priya Shah: account menu">
              <span className="ds-avatar" data-sample="">PS</span>
              {" "}
              <span className="th-name" data-sample="me.name">Priya Shah</span>
              {" "}
              <svg className="th-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="ds-menu-list th-account">
              <div className="th-account-head">
                <span className="ds-avatar" data-sample="">PS</span>
                {" "}
                <span className="th-account-text">
                  {" "}
                  <b data-sample="me.name">Priya Shah</b>
                  {" "}
                  <span data-sample="me.role">Signed in</span>
                  {" "}
                </span>
              </div>
              <a href="/" data-goto="welcome" onClick={goTo("/")}>Sign out</a>
            </div>
          </details>
        </div>
      </header>
    </div>
  );
}
