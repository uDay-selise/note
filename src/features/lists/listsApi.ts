import { blocksClient } from "../../lib/blocks/client";

export type ListRecord = { itemId?: string; name: string; CreatedDate?: string; LastUpdatedDate?: string };
export type TaskRecord = { itemId?: string; name: string; list: string; done: boolean; CreatedDate?: string };

export type GatewayAnswer = { acknowledged?: boolean; errors?: unknown; itemIds?: string[]; message?: string };

const lists = blocksClient.data.collection<ListRecord>("List", { fields: ["name", "CreatedDate"] });
const tasks = blocksClient.data.collection<TaskRecord>("Task", { fields: ["name", "list", "done", "CreatedDate"] });

type Answer = { acknowledged?: boolean; errors?: unknown; message?: string };

export function refusalReason(...answers: unknown[]): string | undefined {
  for (const answer of answers) {
    const record = (answer ?? {}) as Answer;
    if (record.errors) {
      const text = typeof record.errors === "string" ? record.errors : JSON.stringify(record.errors);
      if (text && text !== "null" && text !== "[]" && text !== "{}") return record.message || text;
    }
    if (record.acknowledged === false) return record.message || "The save was refused.";
  }
  return undefined;
}

export function itemIdOf(record: { itemId?: string }): string {
  if (!record.itemId) throw new Error("This record has no id.");
  return record.itemId;
}

type ListAnswer = { data?: { getLists?: { items?: ListRecord[] } } };

export async function fetchLists(): Promise<ListRecord[]> {
  const answer = (await lists.list({ pageNo: 1, pageSize: 50, sort: { CreatedDate: -1 } })) as GatewayAnswer & ListAnswer;
  if (answer.errors) return [];
  return answer.data?.getLists?.items ?? [];
}

type TaskAnswer = { data?: { getTasks?: { items?: TaskRecord[] } } };

export async function fetchTasks(): Promise<TaskRecord[]> {
  const answer = (await tasks.list({ pageNo: 1, pageSize: 500, sort: { CreatedDate: 1 } })) as GatewayAnswer & TaskAnswer;
  if (answer.errors) return [];
  return answer.data?.getTasks?.items ?? [];
}

export async function createList(name: string): Promise<GatewayAnswer> {
  return (await lists.create({ name })) as GatewayAnswer;
}

export async function renameList(id: string, name: string): Promise<GatewayAnswer> {
  return (await lists.update(id, { name })) as GatewayAnswer;
}

export async function removeList(id: string): Promise<GatewayAnswer> {
  return (await lists.delete(id)) as GatewayAnswer;
}

export async function fetchTask(id: string): Promise<TaskRecord | undefined> {
  const answer = (await tasks.get(id)) as TaskAnswer;
  return answer.data?.getTasks?.items?.[0];
}

export async function createTask(name: string, list: string): Promise<GatewayAnswer> {
  return (await tasks.create({ name, list, done: false })) as GatewayAnswer;
}

export async function updateTask(id: string, changes: Partial<Pick<TaskRecord, "name" | "list" | "done">>): Promise<GatewayAnswer> {
  return (await tasks.update(id, changes)) as GatewayAnswer;
}

export async function removeTasks(listId: string): Promise<GatewayAnswer> {
  return (await tasks.delete(listId)) as GatewayAnswer;
}
