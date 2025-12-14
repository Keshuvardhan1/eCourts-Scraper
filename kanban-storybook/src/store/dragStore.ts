import { useState } from "react";

export type DragItem = {
  taskId: string;
  fromColumnId: string;
  fromIndex: number;
};

export const useDragStore = () => {
  const [activeDrag, setActiveDrag] = useState<DragItem | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  return {
    activeDrag,
    setActiveDrag,

    overColumnId,
    setOverColumnId,

    overIndex,
    setOverIndex,
  };
};
