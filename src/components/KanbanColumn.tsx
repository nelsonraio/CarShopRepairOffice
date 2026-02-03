"use client";


import KanbanCard from "./KanbanCard";

interface KanbanCardData {
  id: string;
  proc: string;
  plate: string;
  model: string;
  mechanic: string;
  avatar: string;
}

interface KanbanColumnData {
  id: string;
  title: string;
  color: string;
  cards: KanbanCardData[];
}

interface KanbanColumnProps {
  column: KanbanColumnData;
  onMoveCard: (cardId: string, fromColumnId: string, toColumnId: string) => void;
  columnId: string;
  allColumns: KanbanColumnData[];
  onCardClick?: (card: KanbanCardData, columnTitle: string) => void;
}

export default function KanbanColumn({ column, onMoveCard, allColumns, onCardClick }: KanbanColumnProps) {
  const handleDragStart = (cardId: string) => {
    // Card drag start is handled in KanbanCard component
  };

  const handleDragEnd = () => {
    // Card drag end is handled in KanbanCard component
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId) {
      // Find the original column of the dragged card
      const originalColumn = allColumns.find(col => col.cards.some(card => card.id === cardId));
      if (originalColumn && originalColumn.id !== column.id) {
        onMoveCard(cardId, originalColumn.id, column.id);
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
        className="kanban-column-content space-y-3"
        data-column={column.title}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {column.cards.map(card => (
          <KanbanCard
            key={card.id}
            card={card}
            onDragStart={() => handleDragStart(card.id)}
            onDragEnd={handleDragEnd}
            isDragging={false}
            onClick={() => onCardClick?.(card, column.title)}
          />
        ))}
      </div>
    </div>
  );
}
