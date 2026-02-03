"use client";

import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";

export default function KanbanPage() {
  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="kanban" />
      <main className="flex-1 relative overflow-hidden flex flex-col bg-gray-900">
        <div className="kanban-container p-4 md:p-6 h-full">
          <header className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Quadro da Oficina</h1>
          </header>
          <KanbanBoard />
        </div>
      </main>
    </div>
  );
}
