import { useCallback, useState } from "react";
import type { KanbanData, KanbanTask } from "../components/KanbanBoard/KanbanBoard.types";

export const useKanbanBoard = (initial: KanbanData) => {
  const [board, setBoard] = useState<KanbanData>(initial);

  const saveTask = useCallback((task: KanbanTask) => {
    setBoard(prev => ({ ...prev, tasks: { ...prev.tasks, [task.id]: task } }));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setBoard(prev => {
      const next = { ...prev, tasks: { ...prev.tasks }, columns: { ...prev.columns } };
      for (const col of next.columnOrder) {
        next.columns[col] = { ...next.columns[col], taskIds: next.columns[col].taskIds.filter(id => id !== taskId) };
      }
      delete next.tasks[taskId];
      return next;
    });
  }, []);

  const moveTask = useCallback((taskId: string, fromColumnId: string, fromIndex: number, toColumnId: string, toIndex: number) => {
    setBoard(prev => {
      const next = { ...prev, columns: { ...prev.columns } };
      const from = next.columns[fromColumnId];
      const to = next.columns[toColumnId];
      const a = [...from.taskIds];
      a.splice(fromIndex, 1);
      const b = [...to.taskIds];
      b.splice(toIndex, 0, taskId);
      next.columns[fromColumnId] = { ...from, taskIds: a };
      next.columns[toColumnId] = { ...to, taskIds: b };
      return next;
    });
  }, []);

  const addColumn = useCallback((colId: string, title: string) => {
    setBoard(prev => ({ ...prev, columns: { ...prev.columns, [colId]: { id: colId, title, taskIds: [] } }, columnOrder: [...prev.columnOrder, colId] }));
  }, []);

  const renameColumn = useCallback((colId: string, title: string) => {
    setBoard(prev => ({ ...prev, columns: { ...prev.columns, [colId]: { ...prev.columns[colId], title } } }));
  }, []);

  return { board, saveTask, deleteTask, moveTask, addColumn, renameColumn, setBoard };
};

export default useKanbanBoard;
