import type { KanbanTask } from "../components/KanbanBoard/KanbanBoard.types";

export const makeTask = (overrides: Partial<KanbanTask> = {}): KanbanTask => {
  const id = overrides.id ?? `task-${Math.random().toString(36).slice(2,9)}`;
  const now = new Date().toISOString();
  return {
    id,
    title: overrides.title ?? "New task",
    description: overrides.description ?? "",
    priority: overrides.priority ?? "medium",
    assignee: overrides.assignee,
    tags: overrides.tags ?? [],
    dueDate: overrides.dueDate,
    createdAt: overrides.createdAt ?? now
  };
};
