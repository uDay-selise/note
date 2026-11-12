// Ported by Studio from the agreed design .studio/designs/screens/lists.html, at the start of a build.
// Its markup, classes and CSS are the design's: wire real data, translation keys, routes and SDK
// actions into it and change nothing visual. Studio writes it again only when the design is redrawn;
// then `git diff` shows what to carry over.
import { useEffect, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import { HeaderPart } from "../../app/layout/HeaderPart";
import type { HeaderPerson } from "../../app/layout/HeaderPart";
import { useT } from "../../lib/i18n/LocalizationProvider";
import type { ListRecord, TaskRecord } from "./listsApi";
import { tasksOfList } from "./listsApi";
import "./ListsScreen.css";

/** The situations the design shows: the screen as it usually is, then each one drawn. Show the one the real data or request is in. */
export type ListsScreenSituation = "normal" | "empty" | "error" | "loading" | "no-lists";

export type ListsScreenProps = {
  situation?: ListsScreenSituation;
  onNavigate?: (path: string) => void;
  person: HeaderPerson;
  onSignOut: () => void;
  lists: ListRecord[];
  tasks: TaskRecord[];
  onRetry: () => void;
  onOpenTask: (id: string) => void;
  onToggleTask: (task: TaskRecord) => void;
  onAddTask: (listId: string, name: string) => Promise<string | undefined>;
  onMakeList: (name: string) => Promise<string | undefined>;
  onRenameList: (listId: string, name: string) => Promise<string | undefined>;
  onRemoveList: (listId: string) => Promise<string | undefined>;
  /** A message the last save left, shown under the form it was made in. */
  notice?: { where: "list" | "task"; text: string };
};

export function ListsScreen({ situation = "normal", onNavigate, person, onSignOut, lists, tasks, onRetry, onOpenTask, onToggleTask, onAddTask, onMakeList, onRenameList, onRemoveList, notice }: ListsScreenProps) {
  const { t } = useT();
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [taskFormIn, setTaskFormIn] = useState<string | undefined>();
  const [taskFormList, setTaskFormList] = useState("");
  const [taskName, setTaskName] = useState("");
  const [savingTask, setSavingTask] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | undefined>();
  const [renaming, setRenaming] = useState<string | undefined>();
  const [renameName, setRenameName] = useState("");
  const [renameError, setRenameError] = useState<string | undefined>();
  const [savingRename, setSavingRename] = useState(false);
  const [removing, setRemoving] = useState<string | undefined>();
  const [removeError, setRemoveError] = useState<string | undefined>();
  const [savingRemove, setSavingRemove] = useState(false);
  const renameRef = useRef<HTMLInputElement>(null);
  const [taskError, setTaskError] = useState<string | undefined>();
  const nameRef = useRef<HTMLInputElement>(null);
  const taskRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formOpen) nameRef.current?.focus();
  }, [formOpen]);
  useEffect(() => {
    if (taskFormIn) taskRef.current?.focus();
  }, [taskFormIn]);
  useEffect(() => {
    if (renaming) renameRef.current?.focus();
  }, [renaming]);
  useEffect(() => {
    function close(event: Event) {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      setOpenMenu(undefined);
    }
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, []);

  const goTo = (path: string) => (event: MouseEvent) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(path);
  };

  function openForm() {
    setFormOpen(true);
    setName("");
    setFormError(undefined);
  }

  function cancelForm() {
    setFormOpen(false);
    setName("");
    setFormError(undefined);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    setFormError(undefined);
    if (!trimmed) {
      setFormError(t("lists.form.nameRequired"));
      return;
    }
    if (trimmed.length > 60) {
      setFormError(t("lists.form.hint"));
      return;
    }
    setSaving(true);
    const reason = await onMakeList(trimmed);
    setSaving(false);
    if (reason) {
      setFormError(reason);
      return;
    }
    setFormOpen(false);
    setName("");
  }

  function startTask(listId: string) {
    setTaskFormIn(listId);
    setTaskFormList(listId);
    setTaskName("");
    setTaskError(undefined);
  }

  function startRename(listId: string) {
    const list = lists.find((entry) => entry.itemId === listId);
    setOpenMenu(undefined);
    setRenaming(listId);
    setRenameName(list?.name ?? "");
    setRenameError(undefined);
  }

  function cancelRename() {
    setRenaming(undefined);
    setRenameName("");
    setRenameError(undefined);
  }

  async function submitRename(event: FormEvent) {
    event.preventDefault();
    if (!renaming) return;
    const trimmed = renameName.trim();
    setRenameError(undefined);
    if (!trimmed) {
      setRenameError(t("lists.form.nameRequired"));
      return;
    }
    if (trimmed.length > 60) {
      setRenameError(t("lists.form.hint"));
      return;
    }
    setSavingRename(true);
    const reason = await onRenameList(renaming, trimmed);
    setSavingRename(false);
    if (reason) {
      setRenameError(reason);
      return;
    }
    setRenaming(undefined);
    setRenameName("");
  }

  function startRemove(listId: string) {
    setOpenMenu(undefined);
    setRemoving(listId);
    setRemoveError(undefined);
  }

  function cancelRemove() {
    setRemoving(undefined);
    setRemoveError(undefined);
  }

  async function confirmRemove() {
    if (!removing) return;
    setRemoveError(undefined);
    setSavingRemove(true);
    const reason = await onRemoveList(removing);
    setSavingRemove(false);
    if (reason) {
      setRemoveError(reason);
      return;
    }
    setRemoving(undefined);
  }

  function cancelTask() {
    setTaskFormIn(undefined);
    setTaskFormList("");
    setTaskName("");
    setTaskError(undefined);
  }

  async function submitTask(event: FormEvent) {
    event.preventDefault();
    if (!taskFormIn) return;
    const trimmed = taskName.trim();
    setTaskError(undefined);
    if (!trimmed) {
      setTaskError(t("lists.taskForm.nameRequired"));
      return;
    }
    if (trimmed.length > 200) {
      setTaskError(t("lists.taskForm.nameTooLong"));
      return;
    }
    setSavingTask(true);
    const reason = await onAddTask(taskFormList, trimmed);
    setSavingTask(false);
    if (reason) {
      setTaskError(reason);
      return;
    }
    setTaskFormIn(undefined);
    setTaskName("");
  }

  const eyebrow = person.name ? t("lists.eyebrow", { name: person.name.split(" ")[0] ?? person.name }) : t("lists.eyebrowPlain");

  const head = (withAction: boolean) => (
    <div className="ds-page lists-head">
      <div className="ds-page-head">
        <div>
          <span className="ds-eyebrow">{eyebrow}</span>
          <h1 className="ds-h1 lists-title">{t("lists.title")}</h1>
          <p className="ds-muted lists-sub">{t("lists.sub")}</p>
        </div>
        {withAction ? (
          <div className="ds-actions">
            <button className="ds-btn" type="button" onClick={openForm}> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> {t("lists.makeList")} </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  const emptyBlock = (title: string, detail: string, withButton: boolean) => (
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
        <b style={{ color: "hsl(var(--foreground))", fontSize: "18px" }}>{title}</b>
        {" "}
        <span>{detail}</span>
        {withButton ? (
          <>
            {" "}
            <button className="ds-btn" type="button" style={{ marginTop: "calc(8px * var(--space-scale, 1))" }} onClick={openForm}> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> {t("lists.makeList")} </button>
          </>
        ) : null}
      </div>
    </div>
  );

  const makeListForm = formOpen ? (
    <section className="ds-card ds-panel new-list" id="make-list" aria-label={t("lists.form.title")}>
      <div className="new-list-inner">
        <h2 className="ds-h2" style={{ fontSize: "20px", margin: "0 0 calc(4px * var(--space-scale, 1))" }}>{t("lists.form.title")}</h2>
        <p className="ds-muted" style={{ margin: "0 0 calc(16px * var(--space-scale, 1))", fontSize: "14px" }}>{t("lists.form.detail")}</p>
        <form className="ds-form" onSubmit={(event) => void submit(event)} noValidate>
          <div className="ds-field">
            <label className="ds-label" htmlFor="list-name">{t("lists.form.label")}</label>
            {" "}
            <input className="ds-input" id="list-name" ref={nameRef} type="text" maxLength={60} value={name} onChange={(event) => { setName(event.target.value); setFormError(undefined); }} aria-invalid={formError ? true : undefined} />
            {" "}
            {formError ? <span className="ds-error" role="alert">{formError}</span> : <span className="ds-hint">{t("lists.form.hint")}</span>}
          </div>
          <div className="ds-form-actions">
            <button className="ds-btn ds-btn-secondary" type="button" onClick={cancelForm}>{t("lists.form.cancel")}</button>
            {" "}
            <button className="ds-btn" type="submit" disabled={saving}>{t("lists.form.submit")}</button>
          </div>
        </form>
      </div>
    </section>
  ) : null;

  return (
    <div className="studio-screen-lists" style={{ display: "contents" }}>
      <main data-screen="lists" className="lists-root">
        <div className="ds-deco lists-deco-a" />
        <div className="ds-deco lists-deco-b" />
        <HeaderPart onNavigate={onNavigate} onSignOut={onSignOut} person={person} />
        {situation === "empty" ? (
          <section data-state="empty">
            {head(true)}
            <div className="ds-page lists-body">{emptyBlock(t("lists.empty.title"), t("lists.empty.detail"), true)}</div>
          </section>
        ) : null}
        {situation === "error" ? (
          <section data-state="error">
            {head(false)}
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
                  <button className="ds-btn ds-btn-secondary" type="button" style={{ marginTop: "calc(8px * var(--space-scale, 1))" }} onClick={onRetry}> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 4v5h-5" /></svg> {t("lists.error.retry")} </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}
        {situation === "loading" ? (
          <section data-state="loading">
            {head(false)}
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
            {head(false)}
            <div className="ds-page lists-body">
              {makeListForm}
              {emptyBlock(t("lists.empty.title"), t("lists.taskForm.noLists"), true)}
            </div>
          </section>
        ) : null}
        {situation === "normal" ? (
          <div>
            {head(true)}
            <div className="ds-page lists-body">
              {makeListForm}
              {!formOpen && notice?.where === "list" ? <div className="ds-notice ds-notice-success" style={{ marginBottom: "calc(16px * var(--space-scale, 1))" }}>{notice.text}</div> : null}
              <div className="list-grid lift">
                {lists.map((list) => {
                  const listTasks = tasksOfList(tasks, list.itemId);
                  return (
                    <article className="ds-card list-card" key={list.itemId}>
                      <div className="list-card-top">
                        <div className="list-titles">
                          <h2 className="list-name">{list.name}</h2>
                          <p className="ds-muted list-meta">{t("lists.madeOn", { date: formatDate(list.createdDate) })}</p>
                        </div>
                        <details className="ds-menu" open={openMenu === list.itemId} onToggle={(event) => setOpenMenu(event.currentTarget.open ? list.itemId : undefined)}>
                          <summary className="ds-btn ds-btn-ghost ds-btn-icon" aria-label={t("lists.actionsFor", { name: list.name })}>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                              <circle cx="5" cy="12" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="19" cy="12" r="1.5" />
                            </svg>
                          </summary>
                          <div className="ds-menu-list" onPointerDown={(event) => event.stopPropagation()}>
                            <button type="button" onClick={() => startRename(list.itemId)}>{t("lists.renameList")}</button>
                            {" "}
                            <button type="button" onClick={() => startRemove(list.itemId)}>{t("lists.removeList")}</button>
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
                              <input type="checkbox" className="ds-check" checked={task.done} aria-label={task.done ? t("lists.taskNotDone", { name: task.name }) : t("lists.taskDone", { name: task.name })} onChange={() => onToggleTask(task)} />
                              {" "}
                              <button type="button" className="task-name task-name-button" onClick={() => onOpenTask(task.itemId)}>{task.name}</button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="list-foot">
                        <button className="ds-btn ds-btn-ghost ds-btn-sm" type="button" onClick={() => startTask(list.itemId)}> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> {t("lists.addTask")} </button>
                        {" "}
                        <span className="ds-spacer" />
                        {" "}
                        <span className="ds-muted" style={{ fontSize: "13px" }}>{listTasks.length === 1 ? t("lists.taskCount.one") : t("lists.taskCount.many", { count: listTasks.length })}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
              {notice?.where === "task" ? <div className="ds-notice ds-notice-success" style={{ marginTop: "calc(16px * var(--space-scale, 1))" }}>{notice.text}</div> : null}
            </div>
          </div>
        ) : null}
        {renaming ? (
          <div className="ds-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) cancelRename(); }}>
            <div className="ds-card ds-modal" role="dialog" aria-modal="true" aria-labelledby="rename-list-title">
              <h2 className="ds-h2" id="rename-list-title">{t("lists.renameTitle")}</h2>
              <p className="ds-muted" style={{ margin: "calc(4px * var(--space-scale, 1)) 0 calc(16px * var(--space-scale, 1))", fontSize: "14px" }}>{t("lists.renameDetail")}</p>
              <form className="ds-form" onSubmit={(event) => void submitRename(event)} noValidate>
                <div className="ds-field">
                  <label className="ds-label" htmlFor="rename-list-name">{t("lists.form.label")}</label>
                  {" "}
                  <input className="ds-input" id="rename-list-name" ref={renameRef} type="text" maxLength={60} value={renameName} onChange={(event) => { setRenameName(event.target.value); setRenameError(undefined); }} aria-invalid={renameError ? true : undefined} />
                  {" "}
                  {renameError ? <span className="ds-error" role="alert">{renameError}</span> : <span className="ds-hint">{t("lists.form.hint")}</span>}
                </div>
                <div className="ds-form-actions">
                  <button className="ds-btn ds-btn-secondary" type="button" onClick={cancelRename}>{t("lists.form.cancel")}</button>
                  {" "}
                  <button className="ds-btn" type="submit" disabled={savingRename}>{t("lists.renameSave")}</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
        {removing ? (
          <div className="ds-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) cancelRemove(); }}>
            <div className="ds-card ds-modal" role="dialog" aria-modal="true" aria-labelledby="remove-list-title">
              <h2 className="ds-h2" id="remove-list-title">{t("lists.removeTitle")}</h2>
              <p className="ds-muted" style={{ margin: "calc(4px * var(--space-scale, 1)) 0 calc(16px * var(--space-scale, 1))", fontSize: "14px" }}>{t("lists.removeConfirm")}</p>
              {removeError ? <p className="ds-error" role="alert" style={{ margin: "0 0 calc(12px * var(--space-scale, 1))" }}>{removeError}</p> : null}
              <div className="ds-form-actions">
                <button className="ds-btn ds-btn-secondary" type="button" onClick={cancelRemove}>{t("lists.form.cancel")}</button>
                {" "}
                <button className="ds-btn ds-btn-danger" type="button" disabled={savingRemove} onClick={() => void confirmRemove()}>{t("lists.remove")}</button>
              </div>
            </div>
          </div>
        ) : null}
        {taskFormIn ? (
          <div className="ds-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) cancelTask(); }}>
            <div className="ds-card ds-modal" role="dialog" aria-modal="true" aria-labelledby="add-task-title">
              <h2 className="ds-h2" id="add-task-title">{t("lists.taskForm.title")}</h2>
              <p className="ds-muted" style={{ margin: "calc(4px * var(--space-scale, 1)) 0 calc(16px * var(--space-scale, 1))", fontSize: "14px" }}>{t("lists.taskForm.detail")}</p>
              <form className="ds-form" onSubmit={(event) => void submitTask(event)} noValidate>
                <div className="ds-field">
                  <label className="ds-label" htmlFor="task-name">{t("lists.taskForm.label")}</label>
                  {" "}
                  <input className="ds-input" id="task-name" ref={taskRef} type="text" maxLength={200} value={taskName} onChange={(event) => { setTaskName(event.target.value); setTaskError(undefined); }} aria-invalid={taskError ? true : undefined} />
                  {" "}
                  {taskError ? <span className="ds-error" role="alert">{taskError}</span> : <span className="ds-hint">{t("lists.taskForm.nameHint")}</span>}
                </div>
                <div className="ds-field">
                  <label className="ds-label" htmlFor="task-form-list">{t("lists.taskForm.listLabel")}</label>
                  {" "}
                  <select className="ds-select" id="task-form-list" value={taskFormList} onChange={(event) => { setTaskFormList(event.target.value); setTaskError(undefined); }}>
                    {lists.map((list) => (
                      <option key={list.itemId} value={list.itemId}>{list.name}</option>
                    ))}
                  </select>
                </div>
                <div className="ds-form-actions">
                  <button className="ds-btn ds-btn-secondary" type="button" onClick={cancelTask}>{t("lists.taskForm.cancel")}</button>
                  {" "}
                  <button className="ds-btn" type="submit" disabled={savingTask}>{t("lists.taskForm.submit")}</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", year: "numeric" }).format(date);
}
