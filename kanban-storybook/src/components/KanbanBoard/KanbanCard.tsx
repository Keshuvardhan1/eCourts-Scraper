import React from "react";
import type { KanbanTask } from "./KanbanBoard.types";
import Avatar from "../primitives/Avatar";
import clsx from "clsx";

type Props = {
    task: KanbanTask;
    onDragStart: () => void;
    onDragEnter: () => void;
    onKeyboardDragInit: () => void;
    onClick: () => void;
};

const KanbanCard: React.FC<Props> = ({ task, onDragStart, onDragEnter, onKeyboardDragInit, onClick }) => {
    const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;
    const priorityColor = {
        urgent: "bg-red-200 text-red-800",
        high: "bg-orange-200 text-orange-800",
        medium: "bg-yellow-200 text-yellow-800",
        low: "bg-green-200 text-green-800"
    }[task.priority ?? "low"];

    return (
        <div
            role="button"
            tabIndex={0}
            draggable
            onClick={onClick}
            onDragStart={(e) => { e.dataTransfer.setData("text/plain", task.id); onDragStart(); }}
            onDragEnter={onDragEnter}
            onKeyDown={(e) => { if (e.key === " ") { e.preventDefault(); onKeyboardDragInit(); } }}
            className={clsx("kanban-card bg-white p-4 rounded-xl border border-gray-200 shadow-sm",
                "hover:shadow-md hover:-translate-y-0.5 transition-all",
                "cursor-grab active:cursor-grabbing select-none",
                "flex flex-col gap-3")}
            aria-label={task.title}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <div className="text-sm font-semibold line-clamp-2">{task.title}</div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                        {task.tags?.slice(0, 3).map(t => <span key={t} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{t}</span>)}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className={`${priorityColor} px-2 py-0.5 rounded text-xs font-semibold`}>{task.priority}</div>
                    <Avatar name={task.assignee} />
                </div>
            </div>

            {task.dueDate && <div className="text-right text-xs font-medium" >
                <span className={isOverdue ? "text-red-600" : "text-gray-600"}>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>}
        </div>
    );
};

export default React.memo(KanbanCard);
