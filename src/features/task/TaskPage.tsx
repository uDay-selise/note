import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/AuthProvider";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { useCurrentUser, userInitials } from "../profile/useCurrentUser";
import { fetchLists, fetchTask, updateTask } from "../lists/listsApi";
import { TaskScreen } from "./TaskScreen";
import type { TaskDraft, TaskScreenSituation } from "./TaskScreen";

export function TaskPage({ taskId, onNavigate }: { taskId: string; onNavigate: (path: string) => void }) {
  const { t } = useT();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const me = useCurrentUser();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const taskQuery = useQuery({ queryFn: () => fetchTask(taskId), queryKey: ["task", taskId] });
  const listsQuery = useQuery({ queryFn: fetchLists, queryKey: ["lists"] });
  const task = taskQuery.data;
  const lists = listsQuery.data?.ok ? listsQuery.data.items : [];
  const profile = me.data?.data;
  const person = {
    initials: userInitials(profile),
    name: profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || profile.email || "" : "",
    role: t("header.signedIn")
  };
  const listName = lists.find((list) => list.itemId === task?.list)?.name ?? "";

  const loading = taskQuery.isLoading || listsQuery.isLoading;
  const failed = taskQuery.isError || listsQuery.data?.ok === false;
  const missing = !loading && !failed && !task;
  const situation: TaskScreenSituation = loading ? "normal" : failed ? "error" : missing ? "not-allowed" : task?.done ? "done" : "normal";

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    void queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  async function edit(draft: TaskDraft): Promise<string | undefined> {
    setErrorMessage(undefined);
    try {
      const answer = await updateTask(taskId, { list: draft.list, name: draft.name.trim() });
      if (!answer.ok) return t("task.saveFailed");
      refresh();
      return undefined;
    } catch (caught) {
      console.error("The task couldn't be saved:", caught);
      return t("task.saveFailed");
    }
  }

  async function toggle() {
    if (!task) return;
    setErrorMessage(undefined);
    try {
      const answer = await updateTask(taskId, { done: !task.done });
      if (!answer.ok) {
        setErrorMessage(t("task.toggleFailed"));
        return;
      }
      refresh();
    } catch (caught) {
      console.error("The change didn't save:", caught);
      setErrorMessage(t("task.toggleFailed"));
    }
  }

  return (
    <TaskScreen
      errorMessage={errorMessage}
      listName={listName}
      lists={lists}
      onEdit={edit}
      onNavigate={onNavigate}
      onRetry={() => {
        setErrorMessage(undefined);
        void taskQuery.refetch();
        void listsQuery.refetch();
      }}
      onSignOut={() => void logout()}
      onToggle={() => void toggle()}
      person={person}
      situation={situation}
      task={task}
    />
  );
}
