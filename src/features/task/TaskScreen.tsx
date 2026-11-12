// Ported by Studio from the agreed design .studio/designs/screens/task.html, at the start of a build.
// Its markup, classes and CSS are the design's: wire real data, translation keys, routes and SDK
// actions into it and change nothing visual. Studio writes it again only when the design is redrawn;
// then `git diff` shows what to carry over.
import type { MouseEvent } from "react";
import { HeaderPart } from "../../app/layout/HeaderPart";
import "./TaskScreen.css";

/** The situations the design shows: the screen as it usually is, then each one drawn. Show the one the real data or request is in. */
export type TaskScreenSituation = "normal" | "not-allowed" | "done" | "error";

export function TaskScreen({ situation = "normal", onNavigate }: { situation?: TaskScreenSituation; onNavigate?: (path: string) => void }) {
  const goTo = (path: string) => (event: MouseEvent) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(path);
  };
  return (
    <div className="studio-screen-task" style={{ display: "contents" }}>
      <main data-screen="task">
        <HeaderPart onNavigate={onNavigate} person={{ name: "", initials: "" }} onSignOut={() => undefined} />
        {situation === "not-allowed" ? (
          <section data-state="not-allowed">
            <div className="ds-page tk-wrap">
              <div className="ds-page-head tk-head">
                <div>
                  <span className="ds-eyebrow">Task</span>
                  <h1 className="ds-h1">This task isn't yours.</h1>
                </div>
              </div>
              <div className="ds-card" style={{ padding: "calc(32px * var(--space-scale, 1))" }}>
                <div className="ds-empty">
                  <span className="ds-empty-icon">
                    {" "}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <rect x="4" y="11" width="16" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                    {" "}
                  </span>
                  {" "}
                  <b style={{ color: "hsl(var(--foreground))" }}>This task isn't yours.</b>
                  {" "}
                  <span>Only the person who added a task can open it.</span>
                  {" "}
                  <a href="/lists" className="ds-btn ds-btn-sm" style={{ marginTop: "8px" }} data-goto="lists" onClick={goTo("/lists")}>Back to my lists</a>
                </div>
              </div>
            </div>
          </section>
        ) : null}
        {situation === "done" ? (
          <section data-state="done">
            <div className="ds-page tk-wrap">
              <a href="/lists" className="ds-btn ds-btn-ghost ds-btn-sm tk-crumb" data-goto="lists" onClick={goTo("/lists")}> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M19 12H5M12 19l-7-7 7-7" /></svg> Back to my lists </a>
              <div className="ds-page-head tk-head">
                <div>
                  <span className="ds-eyebrow">Task</span>
                  <h1 className="ds-h1" data-drawn="Task#1.title">Buy milk and oat coffee creamer for Friday</h1>
                  <div className="tk-head-meta">
                    <span>In</span>
                    {" "}
                    <a href="/lists" className="tk-in-list" data-goto="lists" onClick={goTo("/lists")}>
                      {" "}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <path d="M4 6h16M4 12h16M4 18h10" />
                      </svg>
                      {" "}
                      <span data-sample="Task#1.list">Home</span>
                      {" "}
                    </a>
                    {" "}
                    <span className="ds-badge ds-badge-success"><span className="ds-badge-dot" />Done</span>
                  </div>
                </div>
              </div>
              <div className="tk-body">
                <div>
                  <div className="ds-notice ds-notice-success">Saved. This task shows in <b data-sample="Task#1.list">Home</b>.</div>
                  <div className="tk-main" style={{ marginTop: "calc(16px * var(--space-scale, 1))" }}>
                    <div className="tk-status-band">
                      <div>
                        <h2>Done</h2>
                        <p>Nice one. It's sitting with the finished tasks in this list.</p>
                      </div>
                      <button className="ds-btn ds-btn-secondary tk-toggle">Mark not done</button>
                    </div>
                    <div className="tk-section">
                      <h2 className="ds-h2">Name and list</h2>
                      <form className="ds-form" style={{ marginTop: "calc(24px * var(--space-scale, 1))" }}>
                        <div className="ds-field">
                          <label className="ds-label" htmlFor="task-name-done">Task name</label>
                          {" "}
                          <input className="ds-input" id="task-name-done" type="text" defaultValue="Buy milk and oat coffee creamer for Friday" data-drawn="Task#1.title" />
                        </div>
                        <div className="ds-field">
                          <label className="ds-label" htmlFor="task-list-done">List</label>
                          <select className="ds-select" id="task-list-done" defaultValue="Home">
                            <option>Home</option>
                            <option>Work</option>
                            <option>Garden jobs</option>
                            <option>Reading list</option>
                          </select>
                        </div>
                        <div className="ds-form-actions">
                          <button type="button" className="ds-btn ds-btn-secondary" data-goto="lists" onClick={goTo("/lists")}>Cancel</button>
                          {" "}
                          <button type="submit" className="ds-btn">Edit task</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <aside className="tk-side">
                  <div className="ds-card">
                    <h3>Details</h3>
                    <dl className="tk-facts">
                      <div>
                        <dt>Status</dt>
                        <dd>
                          <span className="ds-badge ds-badge-success"><span className="ds-badge-dot" />Done</span>
                        </dd>
                      </div>
                      <div>
                        <dt>List</dt>
                        <dd data-sample="Task#1.list">Home</dd>
                      </div>
                      <div>
                        <dt>Added</dt>
                        <dd data-drawn="">Thu 12 Nov 2026</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="ds-card">
                    <h3>What next</h3>
                    <div className="tk-next">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ flex: "none", marginTop: "2px", color: "hsl(var(--primary-text))" }}>
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {" "}
                      <span>All done here. Back to your lists to pick the next one.</span>
                    </div>
                    <div style={{ marginTop: "calc(16px * var(--space-scale, 1))" }}>
                      <button className="ds-btn ds-btn-secondary" style={{ width: "100%" }} data-goto="lists" onClick={goTo("/lists")}>Back to my lists</button>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        ) : null}
        {situation !== "not-allowed" && situation !== "done" ? (
          <div>
            <div className="ds-page tk-wrap">
              <a href="/lists" className="ds-btn ds-btn-ghost ds-btn-sm tk-crumb" data-goto="lists" onClick={goTo("/lists")}> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M19 12H5M12 19l-7-7 7-7" /></svg> Back to my lists </a>
              <div className="ds-page-head tk-head">
                <div>
                  <span className="ds-eyebrow">Task</span>
                  <h1 className="ds-h1" data-drawn="Task#1.title">Buy milk and oat coffee creamer for Friday</h1>
                  <div className="tk-head-meta">
                    <span>In</span>
                    {" "}
                    <a href="/lists" className="tk-in-list" data-goto="lists" onClick={goTo("/lists")}>
                      {" "}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <path d="M4 6h16M4 12h16M4 18h10" />
                      </svg>
                      {" "}
                      <span data-sample="Task#1.list">Home</span>
                      {" "}
                    </a>
                    {" "}
                    <span className="ds-badge ds-badge-warning"><span className="ds-badge-dot" />Not done</span>
                  </div>
                </div>
              </div>
              <div className="tk-body">
                <div>
                  <div className="tk-main">
                    <div className="tk-status-band">
                      <div>
                        <h2>Not done yet</h2>
                        <p>Tick it done when it's finished.</p>
                      </div>
                      <button className="ds-btn tk-toggle"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="m5 13 4 4L19 7" /></svg> Mark done </button>
                    </div>
                    <div className="tk-section">
                      <h2 className="ds-h2">Name and list</h2>
                      <p className="tk-hint-row">Change the name, or move this task to another of your lists.</p>
                      <form className="ds-form" style={{ marginTop: "calc(24px * var(--space-scale, 1))" }}>
                        <div className="ds-field">
                          <label className="ds-label" htmlFor="task-name">Task name</label>
                          {" "}
                          <input className="ds-input" id="task-name" type="text" defaultValue="Buy milk and oat coffee creamer for Friday" data-drawn="Task#1.title" />
                          {" "}
                          <span className="ds-hint">Up to 200 characters.</span>
                        </div>
                        <div className="ds-field">
                          <label className="ds-label" htmlFor="task-list">List</label>
                          <select className="ds-select" id="task-list" defaultValue="Home">
                            <option>Home</option>
                            <option>Work</option>
                            <option>Garden jobs</option>
                            <option>Reading list</option>
                          </select>
                        </div>
                        <div className="ds-form-actions">
                          <button type="button" className="ds-btn ds-btn-secondary" data-goto="lists" onClick={goTo("/lists")}>Cancel</button>
                          {" "}
                          <button type="submit" className="ds-btn" data-situation="done">Edit task</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <aside className="tk-side">
                  <div className="ds-card">
                    <h3>Details</h3>
                    <dl className="tk-facts">
                      <div>
                        <dt>Status</dt>
                        <dd>
                          <span className="ds-badge ds-badge-warning"><span className="ds-badge-dot" />Not done</span>
                        </dd>
                      </div>
                      <div>
                        <dt>List</dt>
                        <dd data-sample="Task#1.list">Home</dd>
                      </div>
                      <div>
                        <dt>Added</dt>
                        <dd data-drawn="">Thu 12 Nov 2026</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="ds-card">
                    <h3>What next</h3>
                    <div className="tk-next">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ flex: "none", marginTop: "2px", color: "hsl(var(--primary-text))" }}>
                        <path d="M9 18V6l12-2v12" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                      {" "}
                      <span>Mark this task done when it's finished, or go back to your lists to see the rest.</span>
                    </div>
                    <div className="tk-next-btn">
                      <button className="ds-btn ds-btn-secondary" style={{ width: "100%" }} data-goto="lists" onClick={goTo("/lists")}>Back to my lists</button>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        ) : null}
        {situation === "error" ? (
          <section data-state="error">
            <div className="ds-page" style={{ paddingTop: "calc(16px * var(--space-scale, 1))" }}>
              <div className="ds-notice ds-notice-danger">Give the task a name.</div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
