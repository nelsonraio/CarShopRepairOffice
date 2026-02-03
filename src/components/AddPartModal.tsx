import React, { useState } from 'react';

interface Part {
  id: string;
  name: string;
  reference: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  supplier: string;
  stockStatus: 'em_stock' | 'baixo_stock' | 'esgotado';
}

interface AddPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPart: (part: Omit<Part, 'id'>) => void;
}

const AddPartModal: React.FC<AddPartModalProps> = ({ isOpen, onClose, onAddPart }) => {
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    category: '',
    stock: 0,
    minStock: 0,
    price: 0,
    supplier: '',
    stockStatus: 'em_stock' as 'em_stock' | 'baixo_stock' | 'esgotado'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPart(formData);
    setFormData({
      name: '',
      reference: '',
      category: '',
      stock: 0,
      minStock: 0,
      price: 0,
      supplier: '',
      stockStatus: 'em_stock'
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' || name === 'minStock' || name === 'price' ? Number(value) : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Adicionar Nova Peça</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nome da Peça
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Referência
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Categoria
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            >
              <option value="">Selecionar categoria</option>
              <option value="Filtros">Filtros</option>
              <option value="Óleos">Óleos</option>
              <option value="Pastilhas">Pastilhas</option>
              <option value="Discos">Discos</option>
              <option value="Velas">Velas</option>
              <option value="Baterias">Baterias</option>
              <option value="Correias">Correias</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Stock Atual
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Stock Mínimo
              </label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Preço (€)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Fornecedor
            </label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-yellow text-gray-900 rounded-md hover:bg-brand-yellow-dark transition-colors font-medium"
            >
              Adicionar Peça
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPartModal;
