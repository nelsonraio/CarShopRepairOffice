"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import KPICard from "@/components/KPICard";
import VehicleTable from "@/components/VehicleTable";
import FAB from "@/components/FAB";

interface ApiVehicle {
  id: string;
  licensePlate: string;
  clientName?: string;
  make: string;
  model: string;
  status: string;
  lastIntervention?: string;
}

interface ApiOrder {
  id: string;
  client: string;
  vehicle: string;
  mechanic: string;
  openDate: string;
  closeDate?: string;
  total?: number;
}

export default function Dashboard() {
  const [filter, setFilter] = useState("todos");
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [vRes, oRes] = await Promise.all([
          fetch('/api/veiculos', { signal: controller.signal }),
          fetch('/api/ordens-trabalho', { signal: controller.signal })
        ]);

        if (vRes.ok) {
          const vData = await vRes.json();
          setVehicles(Array.isArray(vData) ? vData : []);
        } else {
          setVehicles([]);
        }

        if (oRes.ok) {
          const oData = await oRes.json();
          setOrders(Array.isArray(oData) ? oData : []);
        } else {
          setOrders([]);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching dashboard data', err);
          setError('Erro ao obter dados do servidor');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  const handleFilterChange = (newFilter: string) => setFilter(newFilter);

  const faturacaoTotal = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const carrosNaOficina = vehicles.filter(v => v.status === 'na_oficina').length;
  const prontos = vehicles.filter(v => v.status === 'disponivel').length;

  return (
    <div className="flex h-screen bg-gray-800 text-gray-200 antialiased">
      <Sidebar activePage="dashboard" />
      <main className="flex-1 flex flex-col bg-gray-800">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Faturação (Total ordens)"
              value={`€${faturacaoTotal.toFixed(2)}`}
              onClick={() => handleFilterChange("todos")}
            />
            <KPICard
              title="Carros em Oficina"
              value={carrosNaOficina}
              onClick={() => handleFilterChange("na_oficina")}
            />
            <KPICard
              title="Aguarda Peças"
              value={orders.filter(o => o.closeDate === '').length}
              onClick={() => handleFilterChange("aguarda_pecas")}
            />
            <KPICard
              title="Prontos a Entregar"
              value={prontos}
              onClick={() => handleFilterChange("disponivel")}
            />
          </div>

          {/* Vehicle Table */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Veículos</h2>
            {loading ? (
              <p className="text-gray-400">A carregar dados...</p>
            ) : error ? (
              <p className="text-red-400">{error}</p>
            ) : (
              <VehicleTable filter={filter} vehicles={vehicles} />
            )}
          </div>
        </div>
      </main>

      <FAB />
    </div>
  );
}
