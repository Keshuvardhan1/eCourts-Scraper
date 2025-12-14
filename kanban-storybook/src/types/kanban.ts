export type Priority = "low" | "medium" | "high" | "urgent";

export type KanbanTask = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  assignee?: string;
  tags?: string[];
  dueDate?: string;
};

export type KanbanColumn = {
  id: string;
  title: string;
  taskIds: string[];
};

export type KanbanData = {
  tasks: Record<string, KanbanTask>;
  columns: Record<string, KanbanColumn>;
  columnOrder: string[];
};
