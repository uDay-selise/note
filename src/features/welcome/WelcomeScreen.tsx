// Ported by Studio from the agreed design .studio/designs/screens/welcome.html, at the start of a build.
// Its markup, classes and CSS are the design's: wire real data, translation keys, routes and SDK
// actions into it and change nothing visual. Studio writes it again only when the design is redrawn;
// then `git diff` shows what to carry over.
import type { MouseEvent } from "react";
import "./WelcomeScreen.css";

export function WelcomeScreen({ onNavigate }: { onNavigate?: (path: string) => void }) {
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
            <a href="/" className="wc-brand" data-goto="welcome" aria-label="thursday - 12/11/2026 app home" onClick={goTo("/")}> <span className="wc-mark" aria-hidden="true">{" "}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M5 13l4 4 10-10" /></svg>{" "}</span> thursday - 12/11/2026 app </a>
            <div className="wc-bar-actions">
              <div className="ds-theme-switch" role="group" aria-label="Colour mode">
                <button aria-label="Light">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
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
                <h1 className="wc-title">Keep your tasks<br /><em>in one place.</em></h1>
                <p className="wc-lede"><b>Sign in to see your lists.</b> Make a list for anything, add what you need to do, and tick it off when it's done.</p>
                <div className="wc-cta">
                  <button className="ds-btn ds-btn-lg" data-goto="lists" onClick={goTo("/lists")}>Sign in or create an account</button>
                </div>
                <ul className="wc-steps">
                  <li><span className="wc-step-dot" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h10" /></svg></span>Make a list</li>
                  <li><span className="wc-step-dot" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg></span>Add tasks</li>
                  <li><span className="wc-step-dot" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4 10-10" /></svg></span>Tick them done</li>
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
                    <span data-sample="List#1.name">Home</span>
                    {" "}
                  </span>
                  {" "}
                  <span className="ds-badge ds-badge-quiet" data-sample="">1 of 3 done</span>
                </div>
                <div className="wc-tasks">
                  <div className="wc-task">
                    <span className="wc-box" />
                    {" "}
                    <span className="wc-task-name" data-sample="Task#2.name">Buy milk</span>
                  </div>
                  <div className="wc-task">
                    <span className="wc-box" />
                    {" "}
                    <span className="wc-task-name" data-sample="Task#3.name">Book the dentist</span>
                  </div>
                  <div className="wc-task wc-task-done">
                    <span className="wc-box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 13l4 4 10-10" />
                      </svg>
                    </span>
                    {" "}
                    <span className="wc-task-name" data-sample="Task#1.name">Take out the bins</span>
                  </div>
                </div>
                <div className="wc-art-foot">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="14" height="14">
                    <path d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  {" "}
                  <span>Only you see your lists</span>
                </div>
              </div>
              <div className="wc-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8h.01M11 12h1v4h1" />
                </svg>
                {" "}
                <span>New here? The same page makes your account, so there's just one button to press.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
