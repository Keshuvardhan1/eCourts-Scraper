import type { KanbanData } from "../components/KanbanBoard/KanbanBoard.types";
export const sampleKanbanData: KanbanData = {
  tasks: {
    "task-1": { id:"task-1", title:"Design header", priority:"high", tags:["UI"], assignee:"K", dueDate:"2025-01-20" },
    "task-2": { id:"task-2", title:"Auth routes", priority:"medium", tags:["Backend"], assignee:"A", dueDate:"2025-01-15" },
    "task-3": { id:"task-3", title:"Write docs", priority:"low", tags:["Docs"], assignee:"M", dueDate:"2025-02-01" }
  },
  columns: {
    todo: { id:"todo", title:"To Do", taskIds:["task-1","task-2"] },
    inprogress: { id:"inprogress", title:"In Progress", taskIds:[] },
    done: { id:"done", title:"Done", taskIds:["task-3"] }
  },
  columnOrder: ["todo","inprogress","done"]
};
