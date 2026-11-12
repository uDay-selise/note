import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { useCurrentUser, userDisplayName, userInitials } from "../profile/useCurrentUser";
import { createList, createTask, fetchLists, fetchTasks, refusalReason, updateTask } from "./listsApi";
import { ListsScreen } from "./ListsScreen";
import type { ListsScreenSituation } from "./ListsScreen";
import type { TaskRecord } from "./listsApi";
import { fieldFromEvent, taskNameError } from "./useTaskForms";

export function ListsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { t } = useT();
  const queryClient = useQueryClient();
  const me = useCurrentUser();
  const { logout } = useAuth();
  const listsQuery = useQuery({ queryFn: fetchLists, queryKey: ["lists"] });
  const tasksQuery = useQuery({ queryFn: fetchTasks, queryKey: ["tasks"] });
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [addTaskIn, setAddTaskIn] = useState<string | undefined>();
  const [taskName, setTaskName] = useState("");
  const [savingTask, setSavingTask] = useState(false);
  const [taskMessage, setTaskMessage] = useState<string | undefined>();
  const [taskError, setTaskError] = useState<string | undefined>();
  const [toggleError, setToggleError] = useState<string | undefined>();

  const profile = me.data?.data;
  const firstName = (profile?.firstName || userDisplayName(profile).split(" ")[0] || "").trim() || t("app.name");
  const lists = listsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const loading = listsQuery.isLoading || tasksQuery.isLoading;
  const failed = listsQuery.isError || tasksQuery.isError;
  const situation: ListsScreenSituation = loading ? "loading" : failed ? "error" : lists.length === 0 ? "no-lists" : "normal";

  function openForm() {
    setFormOpen(true);
    setErrorMessage(undefined);
    setMessage(undefined);
    window.setTimeout(() => document.getElementById("list-name")?.focus(), 0);
  }

  function startTask(listId: string) {
    setFormOpen(false);
    setAddTaskIn(listId);
    setTaskName("");
    setTaskError(undefined);
    setTaskMessage(undefined);
    // focus handled by the input itself
  }

  function cancelTask() {
    setAddTaskIn(undefined);
    setTaskName("");
    setTaskError(undefined);
  }

  async function submitTask(event: FormEvent) {
    event.preventDefault();
    const nameValue = fieldFromEvent(event, "name")?.value ?? taskName;
    const trimmed = nameValue.trim();
    setTaskName(nameValue);
    setTaskError(undefined);
    const problem = taskNameError(nameValue, tasks.length, { required: t("lists.taskForm.nameRequired"), limit: t("lists.taskForm.limit") });
    if (problem) {
      setTaskError(problem);
      return;
    }
    if (!addTaskIn) return;
    setSavingTask(true);
    try {
      const answer = await createTask(trimmed, addTaskIn);
      const reason = refusalReason(answer);
      if (reason) {
        setTaskError(t("lists.taskForm.failed"));
        return;
      }
      const list = lists.find((entry) => entry.itemId === addTaskIn);
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setAddTaskIn(undefined);
      setTaskName("");
      setTaskMessage(t("lists.taskForm.saved", { list: list?.name ?? "" }));
    } catch {
      setTaskError(t("lists.taskForm.failed"));
    } finally {
      setSavingTask(false);
    }
  }

  async function toggleTask(task: TaskRecord) {
    setToggleError(undefined);
    const taskKey = String(task.itemId ?? "");
    if (!taskKey) return;
    setTaskError(undefined);
    try {
      const answer = await updateTask(taskKey, { done: !task.done });
      const reason = refusalReason(answer);
      if (reason) {
        setToggleError(t("lists.taskToggle.failed"));
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch {
      setToggleError(t("lists.taskToggle.failed"));
    }
  }

  function closeForm() {
    setFormOpen(false);
    setName("");
    setErrorMessage(undefined);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    setErrorMessage(undefined);
    if (!trimmed) {
      setErrorMessage(t("lists.form.nameRequired"));
      return;
    }
    if (trimmed.length > 60) {
      setErrorMessage(t("lists.form.hint"));
      return;
    }
    if (lists.some((list) => list.name.trim().toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage(t("lists.form.duplicate"));
      return;
    }
    if (lists.length >= 50) {
      setErrorMessage(t("lists.form.limit"));
      return;
    }
    setSaving(true);
    try {
      const answer = await createList(trimmed);
      const reason = refusalReason(answer);
      if (reason) {
        setErrorMessage(t("lists.form.failed"));
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["lists"] });
      setFormOpen(false);
      setName("");
      setMessage(t("lists.form.saved"));
    } catch {
      setErrorMessage(t("lists.form.failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ListsScreen
      data={{
        addTaskIn,
        errorMessage,
        firstName,
        formOpen,
        onCancelTask: cancelTask,
        onStartTask: startTask,
        onSubmitTask: (event) => void submitTask(event),
        onToggleTask: (task) => void toggleTask(task),
        savingTask,
        taskError,
        taskMessage,
        toggleError,
        onSignOut: () => void logout(),
        person: { initials: userInitials(profile), name: userDisplayName(profile) || t("header.signedOut") },
        lists,
        message,
        name,
        onCancel: closeForm,
        onMakeList: openForm,
        onNameChange: (value) => {
          setName(value);
          setErrorMessage(undefined);
        },
        onOpenTask: (id) => onNavigate(`/tasks/${id}`),
        onRetry: () => {
          void listsQuery.refetch();
          void tasksQuery.refetch();
        },
        onSubmit: (event) => void submit(event),
        saving,
        tasks
      }}
      onNavigate={onNavigate}
      situation={situation}
    />
  );
}
