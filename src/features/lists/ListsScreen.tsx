// Ported by Studio from the agreed design .studio/designs/screens/lists.html, at the start of a build.
// Its markup, classes and CSS are the design's: wire real data, translation keys, routes and SDK
// actions into it and change nothing visual. Studio writes it again only when the design is redrawn;
// then `git diff` shows what to carry over.
import type { MouseEvent } from "react";
import { HeaderPart } from "../../app/layout/HeaderPart";
import "./ListsScreen.css";

/** The situations the design shows: the screen as it usually is, then each one drawn. Show the one the real data or request is in. */
export type ListsScreenSituation = "normal" | "empty" | "error" | "loading" | "no-lists";

export function ListsScreen({ situation = "normal", onNavigate }: { situation?: ListsScreenSituation; onNavigate?: (path: string) => void }) {
  const goTo = (path: string) => (event: MouseEvent) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(path);
  };
  return (
    <div className="studio-screen-lists" style={{ display: "contents" }}>
      <main data-screen="lists" className="lists-root">
        <div className="ds-deco lists-deco-a" />
        <div className="ds-deco lists-deco-b" />
        <HeaderPart onNavigate={onNavigate} />
        {situation === "empty" ? (
          <section data-state="empty">
            <div className="ds-page lists-head">
              <div className="ds-page-head">
                <div>
                  <span className="ds-eyebrow" data-sample="me.name">Priya's lists</span>
                  <h1 className="ds-h1 lists-title">My lists</h1>
                  <p className="ds-muted lists-sub">Your own little corners for tasks. Add one, tick it off, done.</p>
                </div>
                <div className="ds-actions">
                  <button className="ds-btn" type="button"> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> Make a list </button>
                </div>
              </div>
            </div>
            <div className="ds-page lists-body">
              <div className="lists-empty">
                <div className="ds-empty" style={{ padding: "0" }}>
                  <span className="ds-empty-icon">
                    {" "}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                      <path d="M4 6h16M4 12h16M4 18h10" />
                      <path d="M17 15l2 2 3.5-3.5" />
                    </svg>
                    {" "}
                  </span>
                  {" "}
                  <b style={{ color: "hsl(var(--foreground))", fontSize: "18px" }}>No lists yet. Make your first list.</b>
                  {" "}
                  <span>Give it a name and start adding tasks to it.</span>
                  {" "}
                  <button className="ds-btn" type="button" style={{ marginTop: "calc(8px * var(--space-scale, 1))" }}> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> Make a list </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}
        {situation === "error" ? (
          <section data-state="error">
            <div className="ds-page lists-head">
              <div className="ds-page-head">
                <div>
                  <span className="ds-eyebrow" data-sample="me.name">Priya's lists</span>
                  <h1 className="ds-h1 lists-title">My lists</h1>
                  <p className="ds-muted lists-sub">Your own little corners for tasks. Add one, tick it off, done.</p>
                </div>
              </div>
            </div>
            <div className="ds-page lists-body">
              <div className="lists-empty">
                <div className="ds-empty" style={{ padding: "0" }}>
                  <span className="ds-empty-icon">
                    {" "}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                      <path d="M12 8v5" />
                      <circle cx="12" cy="16" r="0.75" fill="currentColor" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                    {" "}
                  </span>
                  {" "}
                  <b style={{ color: "hsl(var(--foreground))", fontSize: "18px" }}>Your lists didn't load</b>
                  {" "}
                  <span>Something went wrong on the way. Try again in a moment.</span>
                  {" "}
                  <button className="ds-btn ds-btn-secondary" type="button" style={{ marginTop: "calc(8px * var(--space-scale, 1))" }}> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 4v5h-5" /></svg> Try again </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}
        {situation === "loading" ? (
          <section data-state="loading">
            <div className="ds-page lists-head">
              <div className="ds-page-head">
                <div>
                  <span className="ds-eyebrow" data-sample="me.name">Priya's lists</span>
                  <h1 className="ds-h1 lists-title">My lists</h1>
                  <p className="ds-muted lists-sub">Your own little corners for tasks. Add one, tick it off, done.</p>
                </div>
              </div>
            </div>
            <div className="ds-page lists-body">
              <div className="list-grid">
                <div className="ds-card list-card skel-card">
                  <div className="skel" />
                  <div className="skel" />
                  <div className="skel" />
                  <div className="skel" />
                </div>
                <div className="ds-card list-card skel-card">
                  <div className="skel" />
                  <div className="skel" />
                  <div className="skel" />
                  <div className="skel" />
                </div>
                <div className="ds-card list-card skel-card">
                  <div className="skel" />
                  <div className="skel" />
                  <div className="skel" />
                  <div className="skel" />
                </div>
              </div>
            </div>
          </section>
        ) : null}
        {situation === "no-lists" ? (
          <section data-state="no-lists">
            <div className="ds-page lists-head">
              <div className="ds-page-head">
                <div>
                  <span className="ds-eyebrow" data-sample="me.name">Priya's lists</span>
                  <h1 className="ds-h1 lists-title">My lists</h1>
                  <p className="ds-muted lists-sub">Your own little corners for tasks. Add one, tick it off, done.</p>
                </div>
              </div>
            </div>
            <div className="ds-page lists-body">
              <div className="lists-empty">
                <div className="ds-empty" style={{ padding: "0" }}>
                  <span className="ds-empty-icon">
                    {" "}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                      <path d="M4 6h16M4 12h16M4 18h10" />
                      <path d="M17 15l2 2 3.5-3.5" />
                    </svg>
                    {" "}
                  </span>
                  {" "}
                  <b style={{ color: "hsl(var(--foreground))", fontSize: "18px" }}>Make a list first, then add tasks to it.</b>
                  {" "}
                  <span>Tasks need a home. A list takes a moment to make.</span>
                  {" "}
                  <button className="ds-btn" type="button" style={{ marginTop: "calc(8px * var(--space-scale, 1))" }}> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> Make a list </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}
        {situation !== "empty" && situation !== "error" && situation !== "loading" && situation !== "no-lists" ? (
          <div>
            <div className="ds-page lists-head">
              <div className="ds-page-head">
                <div>
                  <span className="ds-eyebrow" data-sample="me.name">Priya's lists</span>
                  <h1 className="ds-h1 lists-title">My lists</h1>
                  <p className="ds-muted lists-sub">Your own little corners for tasks. Add one, tick it off, done.</p>
                </div>
                <div className="ds-actions">
                  <button className="ds-btn" type="button"> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> Make a list </button>
                </div>
              </div>
            </div>
            <div className="ds-page lists-body">
              <section className="ds-card ds-panel new-list" id="make-list" aria-label="Make a list">
                <div className="new-list-inner">
                  <h2 className="ds-h2" style={{ fontSize: "20px", margin: "0 0 calc(4px * var(--space-scale, 1))" }}>Make a list</h2>
                  <p className="ds-muted" style={{ margin: "0 0 calc(16px * var(--space-scale, 1))", fontSize: "14px" }}>Give it a name you'll spot quickly.</p>
                  <form className="ds-form">
                    <div className="ds-field">
                      <label className="ds-label" htmlFor="list-name">List name</label>
                      {" "}
                      <input className="ds-input" id="list-name" type="text" maxLength={60} placeholder="Work, Home, Weekend jobs" data-sample="List#new.name" />
                      {" "}
                      <span className="ds-hint">Up to 60 characters.</span>
                    </div>
                    <div className="ds-form-actions">
                      <a className="ds-btn ds-btn-secondary" href="#">Cancel</a>
                      {" "}
                      <button className="ds-btn" type="submit">Make list</button>
                    </div>
                  </form>
                </div>
              </section>
              <div className="list-grid lift">
                <article className="ds-card list-card" data-sample="List#1.name">
                  <div className="list-card-top">
                    <div className="list-titles">
                      <h2 className="list-name">Work</h2>
                      <p className="ds-muted list-meta">Made 9 November 2026</p>
                    </div>
                    <details className="ds-menu">
                      <summary className="ds-btn ds-btn-ghost ds-btn-icon" aria-label="Actions for Work">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                          <circle cx="5" cy="12" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="19" cy="12" r="1.5" />
                        </svg>
                      </summary>
                      <div className="ds-menu-list">
                        <a href="/tasks/:id" data-goto="task" onClick={goTo("/tasks/:id")}>Rename list</a>
                        {" "}
                        <a href="#">Remove list</a>
                      </div>
                    </details>
                  </div>
                  <div className="ds-divider" />
                  <div className="task-rows">
                    <div className="task">
                      <input type="checkbox" className="ds-check" aria-label="Mark Send the handover notes done" />
                      {" "}
                      <a href="/tasks/:id" className="task-name" data-goto="task" data-sample="Task#1.title" onClick={goTo("/tasks/:id")}>Send the handover notes</a>
                    </div>
                    <div className="task">
                      <input type="checkbox" className="ds-check" aria-label="Mark Book the room for Thursday's review done" />
                      {" "}
                      <a href="/tasks/:id" className="task-name" data-goto="task" data-sample="Task#2.title" onClick={goTo("/tasks/:id")}>Book the room for Thursday's review, the big one with the screen</a>
                    </div>
                    <div className="task task-done">
                      <input type="checkbox" className="ds-check" defaultChecked aria-label="Mark Reply to Dana about the invoice done" />
                      {" "}
                      <a href="/tasks/:id" className="task-name" data-goto="task" data-sample="Task#3.title" onClick={goTo("/tasks/:id")}>Reply to Dana about the invoice</a>
                    </div>
                  </div>
                  <div className="list-foot">
                    <button className="ds-btn ds-btn-ghost ds-btn-sm" type="button"> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> Add a task </button>
                    {" "}
                    <span className="ds-spacer" />
                    {" "}
                    <span className="ds-muted" style={{ fontSize: "13px" }} data-sample="">3 tasks</span>
                  </div>
                </article>
                <article className="ds-card list-card" data-sample="List#2.name">
                  <div className="list-card-top">
                    <div className="list-titles">
                      <h2 className="list-name">Home</h2>
                      <p className="ds-muted list-meta">Made 7 November 2026</p>
                    </div>
                    <details className="ds-menu">
                      <summary className="ds-btn ds-btn-ghost ds-btn-icon" aria-label="Actions for Home">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                          <circle cx="5" cy="12" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="19" cy="12" r="1.5" />
                        </svg>
                      </summary>
                      <div className="ds-menu-list">
                        <a href="/tasks/:id" data-goto="task" onClick={goTo("/tasks/:id")}>Rename list</a>
                        {" "}
                        <a href="#">Remove list</a>
                      </div>
                    </details>
                  </div>
                  <div className="ds-divider" />
                  <div className="task-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M9 11l3 3 8-8" /><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" /></svg> No tasks in this list yet. Add the first one.</div>
                  <div className="list-foot">
                    <button className="ds-btn ds-btn-ghost ds-btn-sm" type="button"> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> Add a task </button>
                    {" "}
                    <span className="ds-spacer" />
                    {" "}
                    <span className="ds-muted" style={{ fontSize: "13px" }} data-sample="">0 tasks</span>
                  </div>
                </article>
                <article className="ds-card list-card" data-sample="List#3.name">
                  <div className="list-card-top">
                    <div className="list-titles">
                      <h2 className="list-name">Weekend jobs</h2>
                      <p className="ds-muted list-meta">Made 2 November 2026</p>
                    </div>
                    <details className="ds-menu">
                      <summary className="ds-btn ds-btn-ghost ds-btn-icon" aria-label="Actions for Weekend jobs">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                          <circle cx="5" cy="12" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="19" cy="12" r="1.5" />
                        </svg>
                      </summary>
                      <div className="ds-menu-list">
                        <a href="/tasks/:id" data-goto="task" onClick={goTo("/tasks/:id")}>Rename list</a>
                        {" "}
                        <a href="#">Remove list</a>
                      </div>
                    </details>
                  </div>
                  <div className="ds-divider" />
                  <div className="task-rows">
                    <div className="task task-done">
                      <input type="checkbox" className="ds-check" defaultChecked aria-label="Mark Clear the shed done" />
                      {" "}
                      <a href="/tasks/:id" className="task-name" data-goto="task" data-sample="Task#4.title" onClick={goTo("/tasks/:id")}>Clear the shed</a>
                    </div>
                  </div>
                  <div className="list-foot">
                    <button className="ds-btn ds-btn-ghost ds-btn-sm" type="button"> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> Add a task </button>
                    {" "}
                    <span className="ds-spacer" />
                    {" "}
                    <span className="ds-muted" style={{ fontSize: "13px" }} data-sample="">1 task</span>
                  </div>
                </article>
                <article className="ds-card list-card" data-sample="List#4.name">
                  <div className="list-card-top">
                    <div className="list-titles">
                      <h2 className="list-name">Books to read</h2>
                      <p className="ds-muted list-meta">Made 28 October 2026</p>
                    </div>
                    <details className="ds-menu">
                      <summary className="ds-btn ds-btn-ghost ds-btn-icon" aria-label="Actions for Books to read">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                          <circle cx="5" cy="12" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="19" cy="12" r="1.5" />
                        </svg>
                      </summary>
                      <div className="ds-menu-list">
                        <a href="/tasks/:id" data-goto="task" onClick={goTo("/tasks/:id")}>Rename list</a>
                        {" "}
                        <a href="#">Remove list</a>
                      </div>
                    </details>
                  </div>
                  <div className="ds-divider" />
                  <div className="task-rows">
                    <div className="task">
                      <input type="checkbox" className="ds-check" aria-label="Mark Finish The Long Way to a Small Angry Planet done" />
                      {" "}
                      <a href="/tasks/:id" className="task-name" data-goto="task" data-sample="Task#5.title" onClick={goTo("/tasks/:id")}>Finish The Long Way to a Small Angry Planet</a>
                    </div>
                    <div className="task task-done">
                      <input type="checkbox" className="ds-check" defaultChecked aria-label="Mark Borrow Piranesi from the library done" />
                      {" "}
                      <a href="/tasks/:id" className="task-name" data-goto="task" data-sample="Task#6.title" onClick={goTo("/tasks/:id")}>Borrow Piranesi from the library</a>
                    </div>
                  </div>
                  <div className="list-foot">
                    <button className="ds-btn ds-btn-ghost ds-btn-sm" type="button"> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> Add a task </button>
                    {" "}
                    <span className="ds-spacer" />
                    {" "}
                    <span className="ds-muted" style={{ fontSize: "13px" }} data-sample="">2 tasks</span>
                  </div>
                </article>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
