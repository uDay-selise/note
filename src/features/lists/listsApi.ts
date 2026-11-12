import { blocksClient } from "../../lib/blocks/client";

export type ListRecord = {
  itemId: string;
  name: string;
  createdDate: string;
};

export type TaskRecord = {
  itemId: string;
  name: string;
  list: string;
  done: boolean;
  createdDate: string;
};

export type SaveAnswer = {
  ok: boolean;
  /** The gateway's own reason, when it refused a save that still answered 200. */
  reason?: string;
  itemId?: string;
};

type RawAnswer = {
  acknowledged?: boolean;
  errors?: unknown;
  message?: string;
  itemId?: string;
  itemIds?: string[];
  data?: Record<string, { items?: Record<string, unknown>[] }>;
};

const lists = blocksClient.data.collection<Record<string, unknown>>("List", { fields: ["name", "CreatedDate"] });
const tasks = blocksClient.data.collection<Record<string, unknown>>("Task", { fields: ["name", "list", "done", "CreatedDate"] });

function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function recordId(raw: Record<string, unknown>): string {
  return textOf(raw.ItemId ?? raw.itemId);
}

function itemsOf(answer: RawAnswer, queryName: string): Record<string, unknown>[] {
  return answer.data?.[queryName]?.items ?? [];
}

function refusal(answer: RawAnswer): string | undefined {
  if (answer.errors) {
    const text = typeof answer.errors === "string" ? answer.errors : JSON.stringify(answer.errors);
    if (text && text !== "null" && text !== "[]" && text !== "{}") return answer.message || text;
  }
  if (answer.acknowledged === false) return answer.message || "The save was refused.";
  return undefined;
}

function toSaveAnswer(answer: unknown): SaveAnswer {
  const raw = (answer ?? {}) as RawAnswer;
  const reason = refusal(raw);
  if (reason) return { ok: false, reason };
  return { ok: true, itemId: raw.itemId ?? raw.itemIds?.[0] };
}

function toList(raw: Record<string, unknown>): ListRecord {
  return { createdDate: textOf(raw.CreatedDate ?? raw.createdDate), itemId: recordId(raw), name: textOf(raw.name) };
}

function toTask(raw: Record<string, unknown>): TaskRecord {
  return { createdDate: textOf(raw.CreatedDate ?? raw.createdDate), done: Boolean(raw.done), itemId: recordId(raw), list: textOf(raw.list), name: textOf(raw.name) };
}

export type FetchResult<T> = { ok: true; items: T[] } | { ok: false };

export async function fetchLists(): Promise<FetchResult<ListRecord>> {
  const answer = (await lists.list({ pageNo: 1, pageSize: 50, sort: { CreatedDate: -1 } })) as unknown as RawAnswer;
  const reason = refusal(answer);
  if (reason) return { ok: false };
  return { items: itemsOf(answer, "getLists").map(toList), ok: true };
}

export async function fetchTasks(): Promise<FetchResult<TaskRecord>> {
  const answer = (await tasks.list({ pageNo: 1, pageSize: 500, sort: { CreatedDate: 1 } })) as unknown as RawAnswer;
  const reason = refusal(answer);
  if (reason) return { ok: false };
  return { items: itemsOf(answer, "getTasks").map(toTask), ok: true };
}

export async function fetchTask(id: string): Promise<TaskRecord | null> {
  const answer = (await tasks.get(id)) as unknown as RawAnswer;
  if (refusal(answer)) return null;
  const raw = itemsOf(answer, "getTasks")[0];
  return raw ? toTask(raw) : null;
}

export function createList(name: string): Promise<SaveAnswer> {
  return lists.create({ name }).then(toSaveAnswer);
}

export function renameList(id: string, name: string): Promise<SaveAnswer> {
  return lists.update(id, { name }).then(toSaveAnswer);
}

export function removeList(id: string): Promise<SaveAnswer> {
  return lists.delete(id).then(toSaveAnswer);
}

export function createTask(name: string, list: string): Promise<SaveAnswer> {
  return tasks.create({ done: false, list, name }).then(toSaveAnswer);
}

export function updateTask(id: string, changes: Partial<Pick<TaskRecord, "name" | "list" | "done">>): Promise<SaveAnswer> {
  return tasks.update(id, changes).then(toSaveAnswer);
}

export function removeTask(id: string): Promise<SaveAnswer> {
  return tasks.delete(id).then(toSaveAnswer);
}

/** One list's tasks, not-done first and each group in the order it was added. */
export function tasksOfList(all: TaskRecord[], listId: string): TaskRecord[] {
  return all.filter((task) => task.list === listId).sort((a, b) => Number(a.done) - Number(b.done));
}
