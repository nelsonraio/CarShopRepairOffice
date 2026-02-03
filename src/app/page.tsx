"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import KPICard from "@/components/KPICard";
import VehicleTable from "@/components/VehicleTable";
import FAB from "@/components/FAB";

export default function Dashboard() {
  const [filter, setFilter] = useState("todos");

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  return (
    <div className="flex h-screen bg-gray-800 text-gray-200 antialiased">
      <Sidebar activePage="dashboard" />
      <main className="flex-1 flex flex-col bg-gray-800">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Faturação Hoje"
              value="€2,450"
              onClick={() => handleFilterChange("todos")}
            />
            <KPICard
              title="Carros em Oficina"
              value="12"
              onClick={() => handleFilterChange("todos")}
            />
            <KPICard
              title="Aguarda Peças"
              value="3"
              onClick={() => handleFilterChange("aguarda_pecas")}
            />
            <KPICard
              title="Prontos a Entregar"
              value="5"
              onClick={() => handleFilterChange("pronto")}
            />
          </div>

          {/* Vehicle Table */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Veículos em Oficina</h2>
            <VehicleTable filter={filter} />
          </div>
        </div>
      </main>

      <FAB />
    </div>
  );
}
