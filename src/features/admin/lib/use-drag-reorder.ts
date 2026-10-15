"use client";

import { type DragEvent, useState } from "react";

export function useDragReorder(onMove: (from: number, to: number) => void) {
  const [armed, setArmed] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const reset = () => {
    setArmed(null);
    setDragging(null);
    setOver(null);
  };

  const itemProps = (index: number) => ({
    draggable: armed === index,
    onDragStart: (event: DragEvent<HTMLElement>) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
      setDragging(index);
    },
    onDragOver: (event: DragEvent<HTMLElement>) => {
      if (dragging === null) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      if (over !== index) setOver(index);
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      if (dragging !== null && dragging !== index) onMove(dragging, index);
      reset();
    },
    onDragEnd: reset,
    "data-dragging": dragging === index || undefined,
    "data-over": (over === index && dragging !== null && dragging !== index) || undefined,
  });

  const handleProps = (index: number) => ({
    onPointerDown: () => setArmed(index),
    onPointerUp: () => setArmed(null),
  });

  return { itemProps, handleProps };
}
