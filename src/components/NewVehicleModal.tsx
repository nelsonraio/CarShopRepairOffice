"use client";

import { useState } from "react";

interface NewVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewVehicleModal({ isOpen, onClose }: NewVehicleModalProps) {
  const [formData, setFormData] = useState({
    licensePlate: "",
    vin: "",
    make: "",
    model: "",
    year: "",
    color: "",
    mileage: "",
    clientProfile: "normal",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    serviceType: "",
    priority: "normal",
    description: "",
    mechanic: "",
    estimatedTime: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log("New vehicle data:", formData);
    alert("Veículo registado com sucesso!");
    onClose();
    setFormData({
      licensePlate: "",
      vin: "",
      make: "",
      model: "",
      year: "",
      color: "",
      mileage: "",
      clientProfile: "normal",
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      serviceType: "",
      priority: "normal",
      description: "",
      mechanic: "",
      estimatedTime: ""
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-4xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-100">Novo Veículo</h3>
            <p className="text-sm text-brand-yellow font-mono mt-1">Registe um novo veículo na oficina</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Information */}
          <div className="border-b border-gray-600 pb-6">
            <h4 className="text-lg font-semibold text-gray-100 mb-4">Dados do Veículo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-300">Matrícula *</label>
                <input
                  type="text"
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="AA-11-BB"
                  required
                />
              </div>
              <div>
                <label htmlFor="vin" className="block text-sm font-medium text-gray-300">Número do Quadro (VIN)</label>
                <input
                  type="text"
                  id="vin"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="1HGCM82633A123456"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label htmlFor="make" className="block text-sm font-medium text-gray-300">Marca *</label>
                <select
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                  required
                >
                  <option value="">Selecionar marca</option>
                  <option value="audi">Audi</option>
                  <option value="bmw">BMW</option>
                  <option value="mercedes">Mercedes-Benz</option>
                  <option value="volkswagen">Volkswagen</option>
                  <option value="peugeot">Peugeot</option>
                  <option value="renault">Renault</option>
                  <option value="ferrari">Ferrari</option>
                  <option value="other">Outra</option>
                </select>
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-300">Modelo *</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="Golf"
                  required
                />
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-300">Ano</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="2020"
                  min="1900"
                  max="2024"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-300">Cor</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="Branco"
                />
              </div>
              <div>
                <label htmlFor="mileage" className="block text-sm font-medium text-gray-300">Quilometragem</label>
                <input
                  type="number"
                  id="mileage"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="50000"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="clientProfile" className="block text-sm font-medium text-gray-300">Perfil de Cliente</label>
              <select
                id="clientProfile"
                name="clientProfile"
                value={formData.clientProfile}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
              >
                <option value="normal">Normal</option>
                <option value="tvde-interno">TVDE Interno</option>
                <option value="tvde-externo">TVDE Externo</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          {/* Client Information */}
          <div className="border-b border-gray-600 pb-6">
            <h4 className="text-lg font-semibold text-gray-100 mb-4">Dados do Cliente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-300">Nome do Cliente *</label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="João Silva"
                  required
                />
              </div>
              <div>
                <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-300">Telefone *</label>
                <input
                  type="tel"
                  id="clientPhone"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="+351 912 345 678"
                  required
                />
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                id="clientEmail"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                placeholder="joao.silva@email.com"
              />
            </div>
          </div>

          {/* Service Information */}
          <div className="border-b border-gray-600 pb-6">
            <h4 className="text-lg font-semibold text-gray-100 mb-4">Informações do Serviço</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-300">Tipo de Serviço *</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                  required
                >
                  <option value="">Selecionar tipo</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="repair">Reparação</option>
                  <option value="inspection">Inspeção</option>
                  <option value="emergency">Emergência</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-300">Prioridade</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgente</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">Descrição do Problema *</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                placeholder="Descreva o problema ou serviço necessário..."
                required
              />
            </div>
          </div>

          {/* Assignment */}
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-4">Atribuição</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="mechanic" className="block text-sm font-medium text-gray-300">Mecânico Responsável</label>
                <select
                  id="mechanic"
                  name="mechanic"
                  value={formData.mechanic}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                >
                  <option value="">Selecionar mecânico</option>
                  <option value="carlos">Carlos P.</option>
                  <option value="rui">Rui Alves</option>
                  <option value="joaquim">Joaquim F.</option>
                  <option value="auto">Atribuição automática</option>
                </select>
              </div>
              <div>
                <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-300">Tempo Estimado (horas)</label>
                <input
                  type="number"
                  id="estimatedTime"
                  name="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="2"
                  min="0.5"
                  step="0.5"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-none hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-brand-yellow border border-transparent rounded-none hover:bg-brand-yellow-dark"
            >
              Registar Veículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
