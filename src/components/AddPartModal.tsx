import React, { useState, useEffect } from 'react';

interface Supplier {
  id: string;
  nome: string;
}

interface Part {
  id: string;
  name: string;
  reference: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  supplier: string;
  supplierId: string;
  supplierName: string;
  stockStatus: 'em_stock' | 'baixo_stock' | 'esgotado';
  margem_lucro?: number;
  notas?: string;
}

interface AddPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPart: (part: Omit<Part, 'id'>) => void;
}

const AddPartModal: React.FC<AddPartModalProps> = ({ isOpen, onClose, onAddPart }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    category: '',
    stock: 0,
    minStock: 0,
    price: 0,
    supplier: '',
    supplierId: '',
    supplierName: '',
    stockStatus: 'em_stock' as 'em_stock' | 'baixo_stock' | 'esgotado',
    margem_lucro: 0,
    notas: ''
  });

  // Fetch suppliers and categories on mount
  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
      fetchCategories();
    }
  }, [isOpen]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/fornecedores');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categorias-pecas');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get supplier name from selected supplier ID
    const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);
    const supplierName = selectedSupplier ? selectedSupplier.nome : '';
    
    onAddPart({
      ...formData,
      supplier: supplierName,
      supplierId: formData.supplierId,
      supplierName: supplierName
    });
    
    setFormData({
      name: '',
      reference: '',
      category: '',
      stock: 0,
      minStock: 0,
      price: 0,
      supplier: '',
      supplierId: '',
      supplierName: '',
      stockStatus: 'em_stock',
      margem_lucro: 0,
      notas: ''
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' || name === 'minStock' || name === 'price' || name === 'margem_lucro' ? Number(value) : value
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
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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

          <div className="grid grid-cols-2 gap-4">
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
                Margem Lucro (%)
              </label>
              <input
                type="number"
                name="margem_lucro"
                value={formData.margem_lucro}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Fornecedor
            </label>
            {isLoadingSuppliers ? (
              <div className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400">
                A carregar fornecedores...
              </div>
            ) : (
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              >
                <option value="">Selecionar fornecedor</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.nome}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notas
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={3}
              placeholder="Ex: Compatível com sedans Honda, marca XYZ..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow resize-none"
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
