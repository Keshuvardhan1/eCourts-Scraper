import type { KanbanColumn } from "../components/KanbanBoard/KanbanBoard.types";
export const makeColumn = (id: string, title: string): KanbanColumn => ({ id, title, taskIds: [] });
