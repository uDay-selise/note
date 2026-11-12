// Ported by Studio from the agreed design .studio/designs/screens/task.html, at the start of a build.
// Its markup, classes and CSS are the design's: wire real data, translation keys, routes and SDK
// actions into it and change nothing visual. Studio writes it again only when the design is redrawn;
// then `git diff` shows what to carry over.
import { useEffect, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import { HeaderPart } from "../../app/layout/HeaderPart";
import type { HeaderPerson } from "../../app/layout/HeaderPart";
import { useT } from "../../lib/i18n/LocalizationProvider";
import type { ListRecord, TaskRecord } from "../lists/listsApi";
import "./TaskScreen.css";

/** The situations the design shows: the screen as it usually is, then each one drawn. Show the one the real data or request is in. */
export type TaskScreenSituation = "normal" | "not-allowed" | "done" | "error";

export type TaskDraft = { name: string; list: string };

export type TaskScreenProps = {
  situation?: TaskScreenSituation;
  onNavigate?: (path: string) => void;
  person: HeaderPerson;
  onSignOut: () => void;
  task?: TaskRecord;
  lists: ListRecord[];
  listName: string;
  errorMessage?: string;
  onRetry: () => void;
  onToggle: () => void;
  onEdit: (draft: TaskDraft) => Promise<string | undefined>;
};

export function TaskScreen({ situation = "normal", onNavigate, person, onSignOut, task, lists, listName, errorMessage, onRetry, onToggle, onEdit }: TaskScreenProps) {
  const { t } = useT();
  const [draft, setDraft] = useState<TaskDraft>({ list: "", name: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [savedIn, setSavedIn] = useState<string | undefined>();
  const editedRef = useRef(false);

  useEffect(() => {
    setDraft({ list: task?.list ?? "", name: task?.name ?? "" });
    if (!editedRef.current) setFormError(undefined);
  }, [task]);

  const goTo = (path: string) => (event: MouseEvent) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(path);
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = draft.name.trim();
    setFormError(undefined);
    if (!trimmed) {
      setFormError(t("task.nameRequired"));
      return;
    }
    if (trimmed.length > 200) {
      setFormError(t("task.nameTooLong"));
      return;
    }
    setSaving(true);
    const reason = await onEdit({ name: trimmed, list: draft.list });
    setSaving(false);
    editedRef.current = true;
    if (reason) {
      setSavedIn(undefined);
      setFormError(reason);
      return;
    }
    setSavedIn(lists.find((list) => list.itemId === draft.list)?.name ?? "");
  }

  const name = draft.name || task?.name || "";
  const statusBadge = task?.done
    ? <span className="ds-badge ds-badge-success"><span className="ds-badge-dot" />{t("task.done")}</span>
    : <span className="ds-badge ds-badge-warning"><span className="ds-badge-dot" />{t("task.notDone")}</span>;

  const listPicker = (id: string) => (
    <select className="ds-select" id={id} value={draft.list} onChange={(event) => setDraft({ ...draft, list: event.target.value })}>
      {lists.map((list) => (
        <option key={list.itemId} value={list.itemId}>{list.name}</option>
      ))}
    </select>
  );

  const facts = (
    <dl className="tk-facts">
      <div>
        <dt>{t("task.status")}</dt>
        <dd>{statusBadge}</dd>
      </div>
      <div>
        <dt>{t("task.list")}</dt>
        <dd>{listName}</dd>
      </div>
      <div>
        <dt>{t("task.added")}</dt>
        <dd>{formatDate(task?.createdDate)}</dd>
      </div>
    </dl>
  );

  const editForm = (idSuffix: string) => (
    <form className="ds-form" style={{ marginTop: "calc(24px * var(--space-scale, 1))" }} onSubmit={(event) => void submit(event)} noValidate>
      <div className="ds-field">
        <label className="ds-label" htmlFor={`task-name${idSuffix}`}>{t("task.nameLabel")}</label>
        {" "}
        <input className="ds-input" id={`task-name${idSuffix}`} type="text" maxLength={200} value={draft.name} onChange={(event) => { setDraft({ ...draft, name: event.target.value }); setFormError(undefined); }} aria-invalid={formError ? true : undefined} />
        {" "}
        {formError ? <span className="ds-error" role="alert">{formError}</span> : null}
        {formError ? null : <span className="ds-hint">{t("task.nameHint")}</span>}
      </div>
      <div className="ds-field">
        <label className="ds-label" htmlFor={`task-list${idSuffix}`}>{t("task.listLabel")}</label>
        {listPicker(`task-list${idSuffix}`)}
      </div>
      <div className="ds-form-actions">
        <button type="button" className="ds-btn ds-btn-secondary" onClick={goTo("/lists")}>{t("task.cancel")}</button>
        {" "}
        <button type="submit" className="ds-btn" disabled={saving}>{t("task.edit")}</button>
      </div>
    </form>
  );

  return (
    <div className="studio-screen-task" style={{ display: "contents" }}>
      <main data-screen="task">
        <HeaderPart onNavigate={onNavigate} onSignOut={onSignOut} person={person} />
        {situation === "not-allowed" ? (
          <section data-state="not-allowed">
            <div className="ds-page tk-wrap">
              <div className="ds-page-head tk-head">
                <div>
                  <span className="ds-eyebrow">{t("task.eyebrow")}</span>
                  <h1 className="ds-h1">{t("task.notYours")}</h1>
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
                  <b style={{ color: "hsl(var(--foreground))" }}>{t("task.notYours")}</b>
                  {" "}
                  <span>{t("task.notYoursDetail")}</span>
                  {" "}
                  <button type="button" className="ds-btn ds-btn-sm" style={{ marginTop: "8px" }} onClick={goTo("/lists")}>{t("task.back")}</button>
                </div>
              </div>
            </div>
          </section>
        ) : null}
        {situation === "done" ? (
          <section data-state="done">
            <div className="ds-page tk-wrap">
              <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm tk-crumb" onClick={goTo("/lists")}> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M19 12H5M12 19l-7-7 7-7" /></svg> {t("task.back")} </button>
              <div className="ds-page-head tk-head">
                <div>
                  <span className="ds-eyebrow">{t("task.eyebrow")}</span>
                  <h1 className="ds-h1">{name}</h1>
                  <div className="tk-head-meta">
                    <span>{t("task.in")}</span>
                    {" "}
                    <a href="/lists" className="tk-in-list" data-goto="lists" onClick={goTo("/lists")}>
                      {" "}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <path d="M4 6h16M4 12h16M4 18h10" />
                      </svg>
                      {" "}
                      <span>{listName}</span>
                      {" "}
                    </a>
                    {" "}
                    {statusBadge}
                  </div>
                </div>
              </div>
              <div className="tk-body">
                <div>
                  {savedIn ? <div className="ds-notice ds-notice-success" role="status">{t("task.editSaved", { list: savedIn })}</div> : null}
                  <div className="tk-main">
                    <div className="tk-status-band">
                      <div>
                        <h2>{t("task.statusDone")}</h2>
                        <p>{t("task.statusDoneDetail")}</p>
                      </div>
                      <button type="button" className="ds-btn ds-btn-secondary tk-toggle" onClick={onToggle}>{t("task.markNotDone")}</button>
                    </div>
                    <div className="tk-section">
                      <h2 className="ds-h2">{t("task.nameAndList")}</h2>
                      {editForm("-done")}
                    </div>
                  </div>
                </div>
                <aside className="tk-side">
                  <div className="ds-card">
                    <h3>{t("task.details")}</h3>
                    {facts}
                  </div>
                  <div className="ds-card">
                    <h3>{t("task.whatNext")}</h3>
                    <div className="tk-next">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ flex: "none", marginTop: "2px", color: "hsl(var(--primary-text))" }}>
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {" "}
                      <span>{t("task.nextDone")}</span>
                    </div>
                    <div style={{ marginTop: "calc(16px * var(--space-scale, 1))" }}>
                      <button type="button" className="ds-btn ds-btn-secondary" style={{ width: "100%" }} onClick={goTo("/lists")}>{t("task.back")}</button>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        ) : null}
        {situation === "normal" ? (
          <div>
            <div className="ds-page tk-wrap">
              <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm tk-crumb" onClick={goTo("/lists")}> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M19 12H5M12 19l-7-7 7-7" /></svg> {t("task.back")} </button>
              <div className="ds-page-head tk-head">
                <div>
                  <span className="ds-eyebrow">{t("task.eyebrow")}</span>
                  <h1 className="ds-h1">{name}</h1>
                  <div className="tk-head-meta">
                    <span>{t("task.in")}</span>
                    {" "}
                    <a href="/lists" className="tk-in-list" data-goto="lists" onClick={goTo("/lists")}>
                      {" "}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <path d="M4 6h16M4 12h16M4 18h10" />
                      </svg>
                      {" "}
                      <span>{listName}</span>
                      {" "}
                    </a>
                    {" "}
                    {statusBadge}
                  </div>
                </div>
              </div>
              <div className="tk-body">
                <div>
                  {savedIn ? <div className="ds-notice ds-notice-success" role="status">{t("task.editSaved", { list: savedIn })}</div> : null}
                  <div className="tk-main">
                    <div className="tk-status-band">
                      <div>
                        <h2>{t("task.statusNotDone")}</h2>
                        <p>{t("task.statusNotDoneDetail")}</p>
                      </div>
                      <button type="button" className="ds-btn tk-toggle" onClick={onToggle}> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="m5 13 4 4L19 7" /></svg> {t("task.markDone")} </button>
                    </div>
                    <div className="tk-section">
                      <h2 className="ds-h2">{t("task.nameAndList")}</h2>
                      <p className="tk-hint-row">{t("task.hint")}</p>
                      {editForm("")}
                    </div>
                  </div>
                </div>
                <aside className="tk-side">
                  <div className="ds-card">
                    <h3>{t("task.details")}</h3>
                    {facts}
                  </div>
                  <div className="ds-card">
                    <h3>{t("task.whatNext")}</h3>
                    <div className="tk-next">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ flex: "none", marginTop: "2px", color: "hsl(var(--primary-text))" }}>
                        <path d="M9 18V6l12-2v12" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                      {" "}
                      <span>{t("task.nextNotDone")}</span>
                    </div>
                    <div style={{ marginTop: "calc(16px * var(--space-scale, 1))" }}>
                      <button type="button" className="ds-btn ds-btn-secondary" style={{ width: "100%" }} onClick={goTo("/lists")}>{t("task.back")}</button>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        ) : null}
        {errorMessage ? (
          <div className="ds-page" style={{ paddingTop: "calc(16px * var(--space-scale, 1))" }}>
            <div className="ds-notice ds-notice-danger" role="alert">
              <span>{errorMessage}</span>
              {" "}
              <button type="button" className="ds-btn ds-btn-sm ds-btn-secondary" style={{ marginLeft: "auto" }} onClick={onRetry}>{t("task.retry")}</button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
}
