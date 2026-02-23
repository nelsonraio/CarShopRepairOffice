"use client";

interface KanbanCardData {
  id: string;
  proc: string;
  plate?: string;
  model?: string;
  mechanic?: string;
  avatar?: string;
  [key: string]: any;
}

interface KanbanCardProps {
  card: KanbanCardData;
  columnId: string;
  isDragging: boolean;
  onClick?: () => void;
  onDragStart?: (card: KanbanCardData, fromColumnId: string) => void;
  isReadOnly?: boolean;
  shake?: boolean;
}

export default function KanbanCard({ card, columnId, onClick, onDragStart, isReadOnly = false, shake = false }: KanbanCardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ card, fromColumnId: columnId })
    );
    onDragStart?.(card, columnId);
  };

  return (
    <div
      draggable={!isReadOnly}
      onDragStart={handleDragStart}
      className={`bg-gray-800 rounded-lg shadow-md p-4 kanban-card ${
        isReadOnly ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
      } hover:bg-gray-750 transition-colors${shake ? ' shake' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-mono text-brand-yellow mb-1">{card.proc}</p>
          <p className="font-bold text-base text-white">{card.plate}</p>
          <p className="text-sm text-gray-400">{card.model}</p>
        </div>
        <span className="bg-brand-yellow text-gray-900 text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ml-2">
          {card.mechanic || 'N/A'}
        </span>
      </div>
    </div>
  );
}
