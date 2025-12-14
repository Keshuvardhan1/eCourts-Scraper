import React, { useEffect, useState } from "react";
import type { KanbanTask, Priority } from "./KanbanBoard.types";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";

type Props = { isOpen: boolean; task: KanbanTask | null; onClose: () => void; onSave: (t: KanbanTask) => void; onDelete: (id: string) => void; };

const priorities: Priority[] = ["low","medium","high","urgent"];

const TaskModal: React.FC<Props> = ({ isOpen, task, onClose, onSave, onDelete }) => {
  const [local, setLocal] = useState<KanbanTask | null>(task);

  useEffect(() => setLocal(task ? { ...task } : null), [task]);

  if (!isOpen || !local) return null;

  const update = (k: keyof KanbanTask, v: any) => setLocal(prev => prev ? ({ ...prev, [k]: v }) : prev);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? "Edit Task" : "Create Task"}>
      <div className="space-y-3">
        <input className="w-full border rounded p-2" value={local.title} onChange={(e) => update("title", e.target.value)} placeholder="Title" />
        <textarea className="w-full border rounded p-2" rows={3} value={local.description ?? ""} onChange={(e) => update("description", e.target.value)} placeholder="Description" />
        <input className="w-full border rounded p-2" value={local.assignee ?? ""} onChange={(e) => update("assignee", e.target.value)} placeholder="Assignee (initials)" />
        <input className="w-full border rounded p-2" value={local.tags?.join(", ") ?? ""} onChange={(e) => update("tags", e.target.value.split(",").map(s => s.trim()))} placeholder="tags, comma separated" />
        <select className="w-full border rounded p-2" value={local.priority} onChange={(e) => update("priority", e.target.value as Priority)}>
          {priorities.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input type="date" className="w-full border rounded p-2" value={local.dueDate ?? ""} onChange={(e) => update("dueDate", e.target.value)} />

        <div className="flex justify-between pt-4">
          <Button variant="muted" onClick={onClose}>Close</Button>
          <div className="flex gap-2">
            {task && <Button className="bg-red-500" onClick={() => onDelete(task.id)}>Delete</Button>}
            <Button onClick={() => onSave(local)}>Save</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TaskModal;
