"use client";

import { useState } from "react";

interface KanbanCardData {
  id: string;
  proc: string;
  plate: string;
  model: string;
  mechanic: string;
  avatar: string;
}

interface KanbanCardProps {
  card: KanbanCardData;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
  onClick?: () => void;
}

export default function KanbanCard({ card, onDragStart, onDragEnd, isDragging, onClick }: KanbanCardProps) {
  const [isBeingDragged, setIsBeingDragged] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', card.id);
    setIsBeingDragged(true);
    onDragStart();
  };

  const handleDragEnd = () => {
    setIsBeingDragged(false);
    onDragEnd();
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg shadow-md p-4 kanban-card cursor-grab ${
        isBeingDragged ? 'dragging-card' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-mono text-brand-yellow mb-1">{card.proc}</p>
          <p className="font-bold text-base text-white">{card.plate}</p>
          <p className="text-sm text-gray-400">{card.model}</p>
        </div>
        <img
          src={card.avatar}
          alt="Avatar Mecânico"
          className="w-10 h-10 rounded-full border-2 border-gray-600 object-cover"
        />
      </div>
    </div>
  );
}
