"use client";

import { useState } from "react";
import KanbanColumn from "./KanbanColumn";
import KanbanModal from "./KanbanModal";
import KanbanCardDetailsModal from "./KanbanCardDetailsModal";
import FAB from "./FAB";

interface KanbanCard {
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
  cards: KanbanCard[];
}

const initialColumns: KanbanColumnData[] = [
  {
    id: "a-chegar",
    title: "A Chegar",
    color: "text-white",
    cards: [
      {
        id: "a-chegar-1",
        proc: "C1001",
        plate: "AA-11-BB",
        model: "BMW X5",
        mechanic: "Carlos P.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&q=80"
      },
      {
        id: "a-chegar-2",
        proc: "TVDE1002",
        plate: "CC-22-DD",
        model: "Mercedes C-Class",
        mechanic: "Rui Alves",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&q=80"
      }
    ]
  },
  {
    id: "diagnostico",
    title: "Diagnóstico",
    color: "text-yellow-400",
    cards: [
      {
        id: "diagnostico-1",
        proc: "C1003",
        plate: "12-AB-34",
        model: "Ferrari SF90",
        mechanic: "Joaquim F.",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&q=80"
      }
    ]
  },
  {
    id: "aprovacao",
    title: "Aprovação",
    color: "text-purple-400",
    cards: [
      {
        id: "aprovacao-1",
        proc: "C1009",
        plate: "55-GH-78",
        model: "BMW Série 1",
        mechanic: "Carlos P.",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&q=80"
      }
    ]
  },
  {
    id: "aguarda-pecas",
    title: "Aguarda Peças",
    color: "text-orange-400",
    cards: [
      {
        id: "aguarda-pecas-1",
        proc: "C1004",
        plate: "45-GH-23",
        model: "Peugeot 308",
        mechanic: "Rui Alves",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&q=80"
      }
    ]
  },
  {
    id: "em-reparacao",
    title: "Em Reparação",
    color: "text-blue-400",
    cards: [
      {
        id: "em-reparacao-1",
        proc: "TVDE1005",
        plate: "20-XX-45",
        model: "Audi A4",
        mechanic: "Carlos P.",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40&fit=crop&q=80"
      }
    ]
  },
  {
    id: "pronto",
    title: "Pronto",
    color: "text-green-400",
    cards: []
  }
];

export default function KanbanBoard() {
  const [columns, setColumns] = useState<KanbanColumnData[]>(initialColumns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [selectedColumnTitle, setSelectedColumnTitle] = useState<string>('');

  const handleAddCard = (newCard: Omit<KanbanCard, 'id'>) => {
    const card: KanbanCard = {
      ...newCard,
      id: Date.now().toString()
    };

    setColumns(prevColumns =>
      prevColumns.map(col =>
        col.id === 'a-chegar'
          ? { ...col, cards: [...col.cards, card] }
          : col
      )
    );
  };

  const handleMoveCard = (cardId: string, fromColumnId: string, toColumnId: string) => {
    if (fromColumnId === toColumnId) return; // Don't move to the same column

    setColumns(prevColumns => {
      return prevColumns.map(column => {
        if (column.id === fromColumnId) {
          // Remove card from source column
          return {
            ...column,
            cards: column.cards.filter(card => card.id !== cardId)
          };
        } else if (column.id === toColumnId) {
          // Add card to destination column
          const cardToMove = prevColumns
            .find(col => col.id === fromColumnId)
            ?.cards.find(card => card.id === cardId);

          if (cardToMove) {
            return {
              ...column,
              cards: [...column.cards, cardToMove]
            };
          }
        }
        return column;
      });
    });
  };

  const handleCardClick = (card: KanbanCard, columnTitle: string) => {
    setSelectedCard(card);
    setSelectedColumnTitle(columnTitle);
    setIsDetailsModalOpen(true);
  };

  return (
    <>
      <div className="kanban-board">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            onMoveCard={handleMoveCard}
            columnId={column.id}
            allColumns={columns}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      <FAB onClick={() => setIsModalOpen(true)} />

      <KanbanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCard={handleAddCard}
      />

      <KanbanCardDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        card={selectedCard}
        columnTitle={selectedColumnTitle}
      />
    </>
  );
}
