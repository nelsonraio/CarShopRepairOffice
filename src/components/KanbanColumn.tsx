"use client";

import { useState } from "react";
import KanbanCard from "./KanbanCard";

interface KanbanCardData {
  id: string;
  proc: string;
  plate?: string;
  model?: string;
  mechanic?: string;
  avatar?: string;
  estado?: string;
  cliente_nome?: string;
  data_conclusao?: string;
  prioridade?: string;
  total_geral?: number;
  veiculo_matricula?: string;
  veiculo_modelo?: string;
  [key: string]: any;
}

interface KanbanColumnData {
  id: string;
  title: string;
  color: string;
  cards: KanbanCardData[];
}

interface KanbanColumnProps {
  column: KanbanColumnData;
  onCardClick?: (card: KanbanCardData, columnTitle: string) => void;
  onCardDrop?: (card: KanbanCardData, fromColumnId: string, toColumnId: string) => void;
  onCardDragStart?: (card: KanbanCardData, fromColumnId: string) => void;
  isReadOnly?: boolean;
  shakeCardId?: string | null;
}

export default function KanbanColumn({ column, onCardClick, onCardDrop, onCardDragStart, isReadOnly = false, shakeCardId }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const dragData = e.dataTransfer.getData("application/json");
    if (dragData && onCardDrop) {
      try {
        const { card, fromColumnId } = JSON.parse(dragData);
        onCardDrop(card, fromColumnId, column.id);
      } catch (error) {
        console.error("Error parsing drag data:", error);
      }
    }
  };

  const getBadgeColor = (count: number) => {
    if (count === 0) return 'bg-gray-700 text-gray-300';
    if (count < 3) return 'bg-green-400/20 text-green-300';
    return 'bg-red-400/20 text-red-300';
  };

  return (
    <div className="kanban-column">
      <div className="flex justify-between items-center">
        <h2 className={`text-base font-semibold uppercase tracking-wider ${column.color}`}>
          {column.title}
        </h2>
        <span className={`bg-gray-700 text-sm font-bold px-2 py-1 rounded-full text-white`}>
          {column.cards.length}
        </span>
      </div>
      <div
        className={`kanban-column-content space-y-3 transition-all ${
          isDragOver ? 'bg-gray-700/50 rounded-lg p-2 ring-2 ring-brand-yellow' : ''
        }`}
        data-column={column.title}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {column.cards.map(card => (
          <KanbanCard
            key={card.id}
            card={card}
            columnId={column.id}
            isDragging={false}
            onClick={() => onCardClick?.(card, column.title)}
            {...(onCardDragStart && { onDragStart: onCardDragStart })}
            isReadOnly={isReadOnly}
            shake={shakeCardId === card.id}
          />
        ))}
      </div>
    </div>
  );
}
