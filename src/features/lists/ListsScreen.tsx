// Ported by Studio from the agreed design .studio/designs/screens/lists.html, at the start of a build.
// Its markup, classes and CSS are the design's: wire real data, translation keys, routes and SDK
// actions into it and change nothing visual. Studio writes it again only when the design is redrawn;
// then `git diff` shows what to carry over.
import type { ChangeEvent, FormEvent, MouseEvent, ReactNode } from "react";
import { HeaderPart } from "../../app/layout/HeaderPart";
import type { HeaderPerson } from "../../app/layout/HeaderPart";
import { useT } from "../../lib/i18n/LocalizationProvider";
import type { ListRecord, TaskRecord } from "./listsApi";
import "./ListsScreen.css";

/** The situations the design shows: the screen as it usually is, then each one drawn. Show the one the real data or request is in. */
function madeDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function countKey(count: number): "lists.taskCount.one" | "lists.taskCount.many" {
  return count === 1 ? "lists.taskCount.one" : "lists.taskCount.many";
}

function ListMenuIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

export type ListsScreenSituation = "normal" | "empty" | "error" | "loading" | "no-lists";

export type ListsScreenData = {
  firstName: string;
  person: HeaderPerson;
  onSignOut: () => void;
  formOpen: boolean;
  lists: ListRecord[];
  tasks: TaskRecord[];
  name: string;
  onNameChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onMakeList: () => void;
  onCancel: () => void;
  onRetry: () => void;
  saving: boolean;
  message?: string;
  errorMessage?: string;
  onOpenTask: (id: string) => void;
};

export function ListsScreen({ situation = "normal", data, onNavigate }: { situation?: ListsScreenSituation; data: ListsScreenData; onNavigate?: (path: string) => void }) {
  const { t } = useT();
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
        <HeaderPart onNavigate={onNavigate} person={data.person} onSignOut={data.onSignOut} />
        {situation === "empty" ? (
          <section data-state="empty">
            <div className="ds-page lists-head">
              <div className="ds-page-head">
                <div>
                  <span className="ds-eyebrow" data-sample="me.name">{t("lists.eyebrow", { name: data.firstName !== t("app.name") ? data.firstName : "you" })}</span>
                  <h1 className="ds-h1 lists-title">{t("lists.title")}</h1>
                  <p className="ds-muted lists-sub">{t("lists.sub")}</p>
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
                  <b style={{ color: "hsl(var(--foreground))", fontSize: "18px" }}>{t("lists.empty.title")}</b>
                  {" "}
                  <span>{t("lists.empty.detail")}</span>
                  {" "}
                  <button className="ds-btn" type="button" style={{ marginTop: "calc(8px * var(--space-scale, 1))" }} onClick={data.onMakeList}> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> {t("lists.makeList")} </button>
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
                  <span className="ds-eyebrow" data-sample="me.name">{t("lists.eyebrow", { name: data.firstName !== t("app.name") ? data.firstName : "you" })}</span>
                  <h1 className="ds-h1 lists-title">{t("lists.title")}</h1>
                  <p className="ds-muted lists-sub">{t("lists.sub")}</p>
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
                  <b style={{ color: "hsl(var(--foreground))", fontSize: "18px" }}>{t("lists.error.title")}</b>
                  {" "}
                  <span>{t("lists.error.detail")}</span>
                  {" "}
                  <button className="ds-btn ds-btn-secondary" type="button" style={{ marginTop: "calc(8px * var(--space-scale, 1))" }} onClick={data.onRetry}> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 4v5h-5" /></svg> {t("lists.error.retry")} </button>
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
                  <span className="ds-eyebrow" data-sample="me.name">{t("lists.eyebrow", { name: data.firstName !== t("app.name") ? data.firstName : "you" })}</span>
                  <h1 className="ds-h1 lists-title">{t("lists.title")}</h1>
                  <p className="ds-muted lists-sub">{t("lists.sub")}</p>
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
                  <span className="ds-eyebrow" data-sample="me.name">{t("lists.eyebrow", { name: data.firstName !== t("app.name") ? data.firstName : "you" })}</span>
                  <h1 className="ds-h1 lists-title">{t("lists.title")}</h1>
                  <p className="ds-muted lists-sub">{t("lists.sub")}</p>
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
                  <b style={{ color: "hsl(var(--foreground))", fontSize: "18px" }}>{t("lists.noLists.title")}</b>
                  {" "}
                  <span>{t("lists.noLists.detail")}</span>
                  {" "}
                  <button className="ds-btn" type="button" style={{ marginTop: "calc(8px * var(--space-scale, 1))" }} onClick={data.onMakeList}> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> {t("lists.makeList")} </button>
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
                  <span className="ds-eyebrow" data-sample="me.name">{t("lists.eyebrow", { name: data.firstName !== t("app.name") ? data.firstName : "you" })}</span>
                  <h1 className="ds-h1 lists-title">{t("lists.title")}</h1>
                  <p className="ds-muted lists-sub">{t("lists.sub")}</p>
                </div>
                <div className="ds-actions">
                  <button className="ds-btn" type="button" onClick={data.onMakeList}> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> {t("lists.makeList")} </button>
                </div>
              </div>
            </div>
            <div className="ds-page lists-body">
              <section className="ds-card ds-panel new-list" id="make-list" aria-label={t("lists.form.title")} style={data.formOpen ? undefined : { display: "none" }}>
                <div className="new-list-inner">
                  <h2 className="ds-h2" style={{ fontSize: "20px", margin: "0 0 calc(4px * var(--space-scale, 1))" }}>{t("lists.form.title")}</h2>
                  <p className="ds-muted" style={{ margin: "0 0 calc(16px * var(--space-scale, 1))", fontSize: "14px" }}>{t("lists.form.detail")}</p>
                  <form className="ds-form" onSubmit={data.onSubmit}>
                    <div className="ds-field">
                      <label className="ds-label" htmlFor="list-name">{t("lists.form.label")}</label>
                      {" "}
                      <input className="ds-input" id="list-name" type="text" maxLength={60} value={data.name} onChange={(event: ChangeEvent<HTMLInputElement>) => data.onNameChange(event.target.value)} placeholder={t("lists.form.samples")} data-sample="List#new.name" />
                      {" "}
                      <span className="ds-hint">{t("lists.form.hint")}</span>
                      {data.errorMessage ? <span className="ds-hint" role="alert">{data.errorMessage}</span> : null}
                    </div>
                    <div className="ds-form-actions">
                      <a className="ds-btn ds-btn-secondary" href="#" onClick={(event) => { event.preventDefault(); data.onCancel(); }}>{t("lists.form.cancel")}</a>
                      {" "}
                      <button className="ds-btn" type="submit" disabled={data.saving}>{t("lists.form.submit")}</button>
                    </div>
                  </form>
                </div>
              </section>
              <div className="list-grid lift">
                {data.lists.length === 0 ? (
                  <div className="lists-empty">
                    <div className="ds-empty" style={{ padding: "0" }}>
                      <b style={{ color: "hsl(var(--foreground))", fontSize: "18px" }}>{t("lists.empty.title")}</b>
                      <button className="ds-btn" type="button" style={{ marginTop: "calc(8px * var(--space-scale, 1))" }} onClick={data.onMakeList}> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> {t("lists.makeList")} </button>
                    </div>
                  </div>
                ) : null}
                {data.lists.map((list) => {
                  const listTasks = data.tasks
                    .filter((task) => task.list === list.itemId)
                    .sort((a, b) => Number(a.done) - Number(b.done));
                  return (
                    <article className="ds-card list-card" data-sample="List#1.name" key={list.itemId}>
                      <div className="list-card-top">
                        <div className="list-titles">
                          <h2 className="list-name">{list.name}</h2>
                          <p className="ds-muted list-meta">{t("lists.madeOn", { date: madeDate(list.CreatedDate) })}</p>
                        </div>
                        <details className="ds-menu">
                          <summary className="ds-btn ds-btn-ghost ds-btn-icon" aria-label={t("lists.actionsFor", { name: list.name })}>
                            <ListMenuIcon />
                          </summary>
                          <div className="ds-menu-list">
                            <a href="/tasks/:id" data-goto="task" onClick={goTo("/tasks/:id")}>{t("lists.renameList")}</a>
                            {" "}
                            <a href="#">{t("lists.removeList")}</a>
                          </div>
                        </details>
                      </div>
                      <div className="ds-divider" />
                      {listTasks.length === 0 ? (
                        <div className="task-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M9 11l3 3 8-8" /><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" /></svg> {t("lists.noTasks")}</div>
                      ) : (
                        <div className="task-rows">
                          {listTasks.map((task) => (
                            <div className={task.done ? "task task-done" : "task"} key={task.itemId}>
                              <input type="checkbox" className="ds-check" checked={Boolean(task.done)} readOnly aria-label={t("lists.taskDone", { name: task.name })} />
                              {" "}
                              <a href={`/tasks/${task.itemId}`} className="task-name" data-goto="task" data-sample="Task#1.title" onClick={goTo(`/tasks/${task.itemId}`)}>{task.name}</a>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="list-foot">
                        <button className="ds-btn ds-btn-ghost ds-btn-sm" type="button"> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> {t("lists.addTask")} </button>
                        {" "}
                        <span className="ds-spacer" />
                        {" "}
                        <span className="ds-muted" style={{ fontSize: "13px" }} data-sample="">{t(countKey(listTasks.length), { count: String(listTasks.length) })}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
