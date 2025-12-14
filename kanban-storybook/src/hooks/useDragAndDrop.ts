import { useState } from "react";

export type DragItem = { taskId: string; fromColumnId: string; fromIndex: number; };

export const useDragAndDrop = () => {
  const [active, setActive] = useState<DragItem | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  return {
    active,
    setActive,
    overColumn,
    setOverColumn,
    overIndex,
    setOverIndex
  };
};

export default useDragAndDrop;
