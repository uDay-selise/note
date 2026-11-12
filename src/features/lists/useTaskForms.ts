import type { FormEvent } from "react";

export function taskNameError(name: string, total: number, messages: { required: string; limit: string }): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return messages.required;
  if (trimmed.length > 200) return messages.limit;
  if (total >= 500) return messages.limit;
  return undefined;
}

export function fieldFromEvent(event: FormEvent, fieldName: string): HTMLInputElement | undefined {
  const form = event.currentTarget as HTMLFormElement;
  const field = Array.from(form.elements).find((element) => element instanceof HTMLInputElement && element.name === fieldName);
  return field as HTMLInputElement | undefined;
}
