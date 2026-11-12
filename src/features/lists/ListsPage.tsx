import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/AuthProvider";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { useCurrentUser, userInitials } from "../profile/useCurrentUser";
import { createList, createTask, fetchLists, fetchTasks, removeList, removeTask, renameList, tasksOfList, updateTask } from "./listsApi";
import type { TaskRecord } from "./listsApi";
import { ListsScreen } from "./ListsScreen";
import type { ListsScreenSituation } from "./ListsScreen";

export function ListsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { t } = useT();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const me = useCurrentUser();
  const listsQuery = useQuery({ queryFn: fetchLists, queryKey: ["lists"] });
  const tasksQuery = useQuery({ queryFn: fetchTasks, queryKey: ["tasks"] });
  const [notice, setNotice] = useState<{ where: "list" | "task"; text: string } | undefined>();

  const profile = me.data?.data;
  const person = {
    initials: userInitials(profile),
    name: profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || profile.email || "" : "",
    role: t("header.signedIn")
  };
  const listsAnswer = listsQuery.data;
  const tasksAnswer = tasksQuery.data;
  const lists = listsAnswer?.ok ? listsAnswer.items : [];
  const tasks = tasksAnswer?.ok ? tasksAnswer.items : [];
  const loading = listsQuery.isLoading || tasksQuery.isLoading;
  const failed = listsAnswer?.ok === false || tasksAnswer?.ok === false;
  const situation: ListsScreenSituation = loading ? "loading" : failed ? "error" : lists.length === 0 ? "empty" : "normal";

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["lists"] });
    void queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  async function makeList(name: string): Promise<string | undefined> {
    setNotice(undefined);
    const trimmed = name.trim();
    if (lists.some((list) => list.name.trim().toLowerCase() === trimmed.toLowerCase())) return t("lists.form.duplicate");
    if (lists.length >= 50) return t("lists.form.limit");
    try {
      const answer = await createList(trimmed);
      if (!answer.ok) return t("lists.form.failed");
      refresh();
      setNotice({ text: t("lists.form.saved"), where: "list" });
      return undefined;
    } catch (caught) {
      console.error("The list couldn't be saved:", caught);
      return t("lists.form.failed");
    }
  }

  async function rename(listId: string, name: string): Promise<string | undefined> {
    setNotice(undefined);
    const trimmed = name.trim();
    if (lists.some((list) => list.itemId !== listId && list.name.trim().toLowerCase() === trimmed.toLowerCase())) return t("lists.form.duplicate");
    try {
      const answer = await renameList(listId, trimmed);
      if (!answer.ok) return t("lists.form.failed");
      refresh();
      setNotice({ text: t("lists.renameSaved"), where: "list" });
      return undefined;
    } catch (caught) {
      console.error("The list couldn't be renamed:", caught);
      return t("lists.form.failed");
    }
  }

  async function remove(listId: string): Promise<string | undefined> {
    setNotice(undefined);
    try {
      for (const task of tasksOfList(tasks, listId)) {
        const answer = await removeTask(task.itemId);
        if (!answer.ok) return t("lists.removeFailed");
      }
      const answer = await removeList(listId);
      if (!answer.ok) return t("lists.removeFailed");
      refresh();
      setNotice({ text: t("lists.removeSaved"), where: "list" });
      return undefined;
    } catch (caught) {
      console.error("The list couldn't be removed:", caught);
      return t("lists.removeFailed");
    }
  }

  async function addTask(listId: string, name: string): Promise<string | undefined> {
    setNotice(undefined);
    if (tasks.length >= 500) return t("lists.taskForm.limit");
    try {
      const answer = await createTask(name.trim(), listId);
      if (!answer.ok) return t("lists.taskForm.failed");
      const listName = lists.find((list) => list.itemId === listId)?.name ?? "";
      refresh();
      setNotice({ text: t("lists.taskForm.saved", { list: listName }), where: "task" });
      return undefined;
    } catch (caught) {
      console.error("The task couldn't be saved:", caught);
      return t("lists.taskForm.failed");
    }
  }

  async function toggleTask(task: TaskRecord) {
    setNotice(undefined);
    try {
      const answer = await updateTask(task.itemId, { done: !task.done });
      if (!answer.ok) {
        setNotice({ text: t("lists.taskToggle.failed"), where: "task" });
        return;
      }
      refresh();
    } catch (caught) {
      console.error("The change didn't save:", caught);
      setNotice({ text: t("lists.taskToggle.failed"), where: "task" });
    }
  }

  return (
    <ListsScreen
      lists={lists}
      notice={notice}
      onAddTask={addTask}
      onMakeList={makeList}
      onRemoveList={remove}
      onRenameList={rename}
      onNavigate={onNavigate}
      onOpenTask={(id) => onNavigate(`/tasks/${id}`)}
      onRetry={() => {
        void listsQuery.refetch();
        void tasksQuery.refetch();
      }}
      onSignOut={() => void logout()}
      onToggleTask={(task) => void toggleTask(task)}
      person={person}
      situation={situation}
      tasks={tasks}
    />
  );
}

function initialsOf(firstName: string): string {
  return firstName ? firstName.slice(0, 2).toUpperCase() : "?";
}
