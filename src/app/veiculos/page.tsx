'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import VehiclesTable, { type VehicleData } from '../../components/VehiclesTable';
import VehicleHistoryModal from '../../components/VehicleHistoryModal';
import { useFetch, useModal, usePagination } from '@/hooks';

/**
 * Interface simplificada de Veículo para modal de histórico
 */
interface Vehicle {
  id: string;
  plate: string;
  makeModel: string;
  client: string;
  year: number;
  lastIntervention: string;
}

/**
 * Página de Gestão de Veículos
 * 
 * Funcionalidades:
 * - Listagem de veículos cadastrados
 * - Visualização de detalhes (modal)
 * - Visualização de histórico de intervenções (modal)
 * - Eliminação de veículos
 * - Paginação (20 itens por página)
 * - Navegação para registo de novo veículo
 * 
 * Usa hooks customizados:
 * - useFetch: Carrega dados da API
 * - useModal: Controla modais (detalhes e histórico)
 * - usePagination: Gestão de paginação
 */
export default function VeiculosPage() {
  const ITEMS_PER_PAGE = 20;

  // Carrega lista de veículos da API
  const {
    data: vehiclesData = [],
    loading,
    error,
    refetch, // Função para recarregar dados após eliminação
  } = useFetch<VehicleData[]>('/api/veiculos');

  // Modal para detalhes da matrícula/veículo
  const {
    isOpen: plateModalOpen,
    selectedItem: plateDetails,
    select: selectPlateDetails,
    close: closePlateModal,
  } = useModal<VehicleData>();

  // Modal para histórico de intervenções
  const {
    isOpen: isHistoryModalOpen,
    selectedItem: selectedVehicle,
    select: selectHistoryVehicle,
    close: closeHistoryModal,
  } = useModal<Vehicle>();

  const filteredVehicles = vehiclesData ?? [];

  // Paginação com reset automático quando dados mudam
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedVehicles,
    prevPage,
    nextPage,
  } = usePagination(filteredVehicles, ITEMS_PER_PAGE, [filteredVehicles.length]);

  /**
   * Mapeamento de chaves para labels em português no modal de detalhes
   */
  const plateDetailLabels: Record<string, string> = {
    licensePlate: 'Matrícula',
    clientName: 'Cliente',
    clientId: 'ID do Cliente',
    clientProfile: 'Perfil do Cliente',
    make: 'Marca',
    model: 'Modelo',
    year: 'Ano',
    lastIntervention: 'Última Intervenção',
  };
  /**
   * Abre modal de histórico
   * Converte VehicleData para formato Vehicle esperado pelo modal
   */
  const handleViewHistory = useCallback((vehicle: VehicleData) => {
    const vehicleForModal: Vehicle = {
      id: vehicle.id,
      plate: vehicle.licensePlate,
      makeModel: `${vehicle.make} ${vehicle.model}`,
      client: vehicle.clientName || 'Cliente não encontrado',
      year: vehicle.year,
      lastIntervention: vehicle.lastIntervention,
    };
    selectHistoryVehicle(vehicleForModal);
  }, [selectHistoryVehicle]);

  /**
   * Abre modal de detalhes ao clicar na matrícula
   */
  const handlePlateClick = useCallback((vehicle: VehicleData) => {
    selectPlateDetails(vehicle);
  }, [selectPlateDetails]);

  /**
   * Elimina veículo e recarrega lista
   * Confirmação é feita no componente VehiclesTable
   */
  const handleDelete = async (id: string) => {

    try {
      const response = await fetch(`/api/veiculos/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await refetch(); // Recarrega dados após eliminação
      }
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="veiculos" />

      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 leading-tight">Veículos</h2>
            <p className="mt-1 text-gray-400">Gerencie a frota de veículos</p>
          </div>
          <Link
            href="/veiculos/novo"
            className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Novo Veículo
          </Link>

        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-400">Carregando veículos...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-none">
            Erro ao carregar veículos: {error}
          </div>
        ) : (
          <>
            <VehiclesTable
              vehicles={paginatedVehicles}
              onViewHistory={handleViewHistory}
              onDelete={handleDelete}
              onPlateClick={handlePlateClick}
            />
            {/* Plate Details Modal */}
            {plateModalOpen && plateDetails && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-2xl mx-4">
                  <h3 className="text-xl font-bold text-white mb-4">Detalhes do Veículo</h3>
                  <div className="space-y-2 text-gray-200">
                    {Object.entries(plateDetails).map(([key, value]) => {
                      const label = plateDetailLabels[key] || key.replace(/_/g, ' ').toUpperCase();
                      return (
                        <div className="text-gray-100" key={key}>
                          <span className="font-semibold">{label}:</span> {typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={closePlateModal}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {filteredVehicles.length > 0 && (
              <div className="mt-4 bg-gray-700 px-4 py-3 border border-gray-600 flex items-center justify-between rounded">
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      A mostrar <span className="font-medium text-gray-200">{startIndex + 1}</span> a <span className="font-medium text-gray-200">{Math.min(endIndex, filteredVehicles.length)}</span> de <span className="font-medium text-gray-200">{filteredVehicles.length}</span> veículos
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 text-gray-300 rounded border border-gray-500 transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-400 px-3">
                      Página <span className="font-medium text-gray-200">{currentPage}</span> de <span className="font-medium text-gray-200">{totalPages}</span>
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 text-gray-300 rounded border border-gray-500 transition-colors"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </main>

      <VehicleHistoryModal isOpen={isHistoryModalOpen} onClose={closeHistoryModal} vehicle={selectedVehicle} />

    </div>
  );
}
