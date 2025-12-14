import React from "react";
import type { KanbanTask } from "../../types/kanban";

type TaskCardProps = {
  task: KanbanTask;
  onDragStart: () => void;
  onDragEnter: () => void;
  onKeyboardDragInit: () => void;
  onClick: () => void;
};

const ITEM_HEIGHT = 96; // used by virtualization math elsewhere (approximate)

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-200 text-red-800";
    case "high":
      return "bg-orange-200 text-orange-800";
    case "medium":
      return "bg-yellow-200 text-yellow-800";
    default:
      return "bg-green-200 text-green-800";
  }
};

const TaskCardInner: React.FC<TaskCardProps> = ({
  task,
  onDragStart,
  onDragEnter,
  onKeyboardDragInit,
  onClick,
}) => {
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onKeyDown={(e) => {
        if (e.key === " ") {
          e.preventDefault();
          onKeyboardDragInit();
        }
      }}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      className="bg-white border shadow-sm rounded-lg p-3 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
      style={{ minHeight: ITEM_HEIGHT - 8 }} // consistent height for virtualization math
    >
      <p className="font-semibold text-sm line-clamp-2">{task.title}</p>

      <span
        className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(
          task.priority
        )}`}
      >
        {task.priority}
      </span>

      {task.tags && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-3">
        {task.assignee ? (
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
            {task.assignee[0].toUpperCase()}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300" />
        )}

        {task.dueDate && (
          <span
            className={`text-xs font-semibold ${
              isOverdue ? "text-red-600" : "text-gray-600"
            }`}
          >
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

// Memoize to avoid re-rendering cards unnecessarily.
// We do a shallow compare of the task id and a few important props.
const TaskCard = React.memo(
  TaskCardInner,
  (prev, next) =>
    prev.task.id === next.task.id &&
    prev.task.title === next.task.title &&
    prev.task.priority === next.task.priority &&
    prev.task.assignee === next.task.assignee &&
    // tags/dueDate rarely change - include for safety
    JSON.stringify(prev.task.tags) === JSON.stringify(next.task.tags) &&
    prev.task.dueDate === next.task.dueDate
);

export default TaskCard;
export { ITEM_HEIGHT };
