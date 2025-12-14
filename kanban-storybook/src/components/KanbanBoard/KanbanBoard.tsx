import React, { useCallback, useEffect, useMemo, Suspense, useState } from "react";
import type { KanbanData, KanbanTask } from "./KanbanBoard.types";
import KanbanColumn from "./KanbanColumn";
import useDragAndDrop from "../../hooks/useDragAndDrop";
import useKanbanBoard from "../../hooks/useKanbanBoard";
import { makeTask } from "../../utils/task.utils";
const TaskModal = React.lazy(() => import("./TaskModal"));

type Props = { data: KanbanData };

const KanbanBoard: React.FC<Props> = ({ data }) => {
  const { board, saveTask, deleteTask, moveTask, addColumn, renameColumn } = useKanbanBoard(data);
  const { active, setActive, overColumn, setOverColumn, overIndex, setOverIndex } = useDragAndDrop();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState<KanbanTask | null>(null);

  const openModal = useCallback((task: KanbanTask | null) => { setModalTask(task); setModalOpen(true); }, []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const createQuickTask = useCallback((columnId: string) => {
    const t = makeTask({ title: "New task", assignee: undefined });
    saveTask(t);
    moveTask(t.id, columnId, 0, columnId, 0);
    openModal(t);
  }, [saveTask, moveTask, openModal]);

  const handleDragStart = useCallback((taskId: string, fromColumnId: string, idx: number) => {
    setActive({ taskId, fromColumnId, fromIndex: idx });
  }, [setActive]);

  const handleDragEnter = useCallback((columnId: string, index: number) => {
    setOverColumn(columnId);
    setOverIndex(index);
  }, [setOverColumn, setOverIndex]);

  const handleDrop = useCallback(() => {
    if (!active || !overColumn || overIndex === null) return;
    moveTask(active.taskId, active.fromColumnId, active.fromIndex, overColumn, overIndex);
    setActive(null);
    setOverColumn(null);
    setOverIndex(null);
  }, [active, overColumn, overIndex, moveTask, setActive, setOverColumn, setOverIndex]);

  const allowDrop = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      const colIds = board.columnOrder;
      const curr = overColumn ?? active.fromColumnId;
      const currIdx = colIds.indexOf(curr);
      const taskList = board.columns[curr].taskIds;
      let newCol = currIdx;
      let newIndex = overIndex ?? active.fromIndex;

      if (e.key === "ArrowRight") newCol = Math.min(colIds.length - 1, currIdx + 1);
      if (e.key === "ArrowLeft") newCol = Math.max(0, currIdx - 1);
      if (e.key === "ArrowDown") newIndex = Math.min(taskList.length, newIndex + 1);
      if (e.key === "ArrowUp") newIndex = Math.max(0, newIndex - 1);

      if (e.key === "Enter") { handleDrop(); return; }
      if (e.key === "Escape") { setActive(null); setOverColumn(null); setOverIndex(null); return; }

      setOverColumn(colIds[newCol]);
      setOverIndex(newIndex);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, overColumn, overIndex, board, moveTask, setActive, setOverColumn, setOverIndex, handleDrop]);

  const columns = useMemo(() => board.columnOrder.map(id => ({ id, column: board.columns[id], tasks: board.columns[id].taskIds.map(tid => board.tasks[tid]) })), [board]);

  return (
    <div className="w-full h-screen bg-gray-100 flex justify-center items-start overflow-x-auto py-10 px-6" onDrop={handleDrop} onDragOver={allowDrop}>
      <div className="flex gap-6">
        <div className="flex items-center gap-3 absolute left-4 top-4 z-20">
          <button className="px-3 py-2 bg-white rounded shadow" onClick={() => addColumn(`col-${Date.now().toString(36).slice(2, 6)}`, "New Column")}>+ Add column</button>
        </div>

        {active && (
          <div className="pointer-events-none fixed top-6 right-6 w-64 z-50 opacity-80">
            <div className="p-2 bg-white rounded shadow">
              <div className="text-sm font-semibold">{board.tasks[active.taskId]?.title}</div>
              <div className="text-xs text-gray-500">{board.tasks[active.taskId]?.priority}</div>
            </div>
          </div>
        )}

        <Suspense fallback={null}>
          {modalOpen && modalTask && <TaskModal isOpen={modalOpen} task={modalTask} onClose={closeModal} onSave={(t) => { saveTask(t); closeModal(); }} onDelete={(id) => { deleteTask(id); closeModal(); }} />}
        </Suspense>

        {columns.map(({ id, column, tasks }) => (
          <div key={id} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg">{column.title}</h2>
              <button className="text-xs text-gray-500" onClick={() => { const newTitle = prompt("Rename column", column.title); if (newTitle) renameColumn(column.id, newTitle); }}>Rename</button>
              <button className="text-xs text-gray-500" onClick={() => createQuickTask(column.id)}>+Task</button>
            </div>

            <KanbanColumn
              column={column}
              tasks={tasks}
              isOver={overColumn === column.id}
              dropIndex={overColumn === column.id ? overIndex : null}
              onTaskDragStart={(taskId, fromColumnId, idx) => handleDragStart(taskId, fromColumnId, idx)}
              onTaskDragEnter={(colId, idx) => handleDragEnter(colId, idx)}
              onKeyboardDragEnter={(colId, idx) => { setOverColumn(colId); setOverIndex(idx); }}
              onTaskClick={(task) => { setModalTask(task); setModalOpen(true); }}
            />
          </div>
        ))}
      </div>

    </div>
  );
};

export default KanbanBoard;
