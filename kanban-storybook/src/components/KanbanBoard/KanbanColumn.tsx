import React, { useRef, useEffect, useState, useCallback } from "react";
import type { KanbanColumn as KanbanColumnType, KanbanTask } from "./KanbanBoard.types";
import KanbanCard from "./KanbanCard";
import clsx from "clsx";

type Props = {
  column: KanbanColumnType;
  tasks: KanbanTask[];
  isOver: boolean;
  dropIndex: number | null;
  onTaskDragStart: (taskId: string, fromColumnId: string, index: number) => void;
  onTaskDragEnter: (columnId: string, index: number) => void;
  onKeyboardDragEnter: (columnId: string, index: number) => void;
  onTaskClick: (task: KanbanTask) => void;
};

const ITEM_HEIGHT = 96;
const VIRTUALIZE_THRESHOLD = 60;

const KanbanColumn: React.FC<Props> = ({ column, tasks, isOver, dropIndex, onTaskDragStart, onTaskDragEnter, onKeyboardDragEnter, onTaskClick }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(Math.min(tasks.length, 12));

  useEffect(() => {
    setEnd(Math.min(tasks.length, end));
    setStart(s => Math.max(0, Math.min(s, Math.max(0, tasks.length - 1))));
  }, [tasks.length]);

  const onScroll = useCallback(() => {
    if (!ref.current) return;
    const top = ref.current.scrollTop;
    const visible = Math.ceil((ref.current.clientHeight || 600) / ITEM_HEIGHT);
    const approxStart = Math.floor(top / ITEM_HEIGHT);
    const buffer = 6;
    setStart(Math.max(0, approxStart - buffer));
    setEnd(Math.min(tasks.length, approxStart + visible + buffer));
  }, [tasks.length]);

  useEffect(() => {
    if (!ref.current) return;
    if (tasks.length < VIRTUALIZE_THRESHOLD) return;
    const el = ref.current;
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll, tasks.length]);

  const useVirtual = tasks.length >= VIRTUALIZE_THRESHOLD;
  const visible = useVirtual ? tasks.slice(start, end) : tasks;
  const topSpacer = useVirtual ? start * ITEM_HEIGHT : 0;
  const bottomSpacer = useVirtual ? (tasks.length - end) * ITEM_HEIGHT : 0;
  const localDrop = dropIndex === null ? null : (useVirtual ? (dropIndex - start) : dropIndex);

  return (
    <div className={clsx(
      "w-[320px] min-w-[320px] bg-white rounded-2xl p-4 shadow-md border",
      isOver ? "border-blue-400 bg-blue-50/40" : "border-gray-200"
    )}>
      <div className="p-4 border-b flex items-center justify-between gap-2">
        <h3 className="font-semibold">{column.title}</h3>
      </div>

      <div ref={ref} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" onDragEnter={() => { if (tasks.length === 0) onTaskDragEnter(column.id, 0); }}>
        {tasks.length === 0 && <div className="text-gray-400 italic text-sm text-center">No tasks</div>}

        {topSpacer > 0 && <div style={{ height: topSpacer }} />}

        {visible.map((task, idx) => {
          const realIndex = useVirtual ? start + idx : idx;
          const show = localDrop !== null && localDrop === idx;
          return (
            <React.Fragment key={task.id}>
              {show && <div className="drop-indicator w-full" />}
              <KanbanCard
                task={task}
                onDragStart={() => onTaskDragStart(task.id, column.id, realIndex)}
                onDragEnter={() => onTaskDragEnter(column.id, realIndex)}
                onKeyboardDragInit={() => onKeyboardDragEnter(column.id, realIndex)}
                onClick={() => onTaskClick(task)}
              />
            </React.Fragment>
          );
        })}

        {localDrop !== null && localDrop === (useVirtual ? end - start : tasks.length) && <div className="drop-indicator w-full" />}

        {bottomSpacer > 0 && <div style={{ height: bottomSpacer }} />}
      </div>
    </div>
  );
};

export default React.memo(KanbanColumn);
