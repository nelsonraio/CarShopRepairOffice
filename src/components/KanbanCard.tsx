"use client";

interface KanbanCardData {
  id: string;
  proc: string;
  plate?: string;
  model?: string;
  mechanic?: string;
  avatar?: string;
  estado?: string;
  contacto_nome?: string | null;
  contacto_telefone?: string | null;
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
  const isReceptionCard = columnId === 'em_recepcao' || card.estado === 'em_recepcao';
  const vehicleLabel = isReceptionCard
    ? [card.veiculo_marca, card.model].filter(Boolean).join(' ').trim() || card.model || 'N/A'
    : card.model;

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
      <div className="flex flex-col gap-3 w-full">
        <div className="flex-1">
          <p className="text-xs font-mono text-brand-yellow mb-1">{card.proc}</p>
          <p className="font-bold text-base text-white">{card.plate}</p>
          <p className="text-sm text-gray-400">{vehicleLabel}</p>
        </div>
        <span className="inline-flex w-fit bg-brand-yellow text-gray-900 text-xs font-semibold px-2 py-1 rounded whitespace-nowrap">
          {card.mechanic || 'N/A'}
        </span>
      </div>
    </div>
  );
}
