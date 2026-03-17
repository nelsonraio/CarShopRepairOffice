import React, { useState, useEffect } from 'react';

interface Supplier {
  id: string;
  nome: string;
}

interface Part {
  id: string | number;
  name: string;
  reference: string;
  category: { id: number; nome: string };
  stock: number;
  minStock?: number;
  price: number;
  stockStatus: 'em_stock' | 'baixo_stock' | 'esgotado';
  margem_lucro?: number;
  notas?: string;
}

interface EditPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (part: Part) => void;
  part: Part | null;
}

const EditPartModal: React.FC<EditPartModalProps> = ({ isOpen, onClose, onEdit, part }) => {
  const [categories, setCategories] = useState<{ id: string | number; nome: string }[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    category: '', // will hold the category id as string
    stock: '',
    minStock: '',
    price: '',
    stockStatus: 'em_stock' as 'em_stock' | 'baixo_stock' | 'esgotado',
    margem_lucro: '',
    notas: ''
  });

  // Populate form data when part changes
  useEffect(() => {
    if (part && categories.length > 0) {
      let categoryId = '';
      // Se category for objeto com id, usar esse id
      if (part.category && typeof part.category === 'object' && 'id' in part.category) {
        categoryId = String(part.category.id);
      } else if ('categoriaId' in part && part.categoriaId) {
        categoryId = String(part.categoriaId);
      } else if ('categoryId' in part && part.categoryId) {
        categoryId = String(part.categoryId);
      } else if (typeof part.category === 'string') {
        // fallback: procurar pelo nome
        const foundCat = categories.find(cat => cat.id === part.category.id);
        categoryId = foundCat ? String(foundCat.id) : '';
      }
      setFormData({
        name: part.name || '',
        reference: part.reference || '',
        category: categoryId,
        stock: String(part.stock ?? 0),
        minStock: String(part.minStock ?? 0),
        price: String(part.price ?? 0),
        stockStatus: part.stockStatus || 'em_stock',
        margem_lucro: String(part.margem_lucro ?? 0),
        notas: part.notas || ''
      });
    }
  }, [part, categories]);

  // Fetch suppliers and categories on mount
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Removed fetchSuppliers

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categorias-pecas');
      if (response.ok) {
        // Espera array de objetos { id, nome, descricao }
        const data = await response.json();
        if (Array.isArray(data) && typeof data[0] === 'object' && data[0].id) {
          setCategories(data.map((c: any) => ({ id: c.id, nome: c.nome })));
        } else if (Array.isArray(data)) {
          // fallback para array de nomes
          setCategories(data.map((nome: string, idx: number) => ({ id: String(idx + 1), nome })));
        } else {
          setCategories([]);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!part) return;
    // Enviar categoriaId (id) e manter category (nome) para UI
    const selectedCat = categories.find(cat => String(cat.id) === formData.category);
    const updatedPart: Part & { categoriaId?: string | number } = {
      ...part,
      name: formData.name,
      reference: formData.reference,
      category: selectedCat ? { id: Number(selectedCat.id), nome: selectedCat.nome } : { id: 0, nome: '' },
      categoriaId: formData.category,
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 0,
      price: Number(formData.price) || 0,
      stockStatus: formData.stockStatus,
      margem_lucro: Number(formData.margem_lucro) || 0,
      notas: formData.notas
    };
    onEdit(updatedPart);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Editar Peça</h2>

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
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
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

          {/* Removed supplier field */}

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
              Guardar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPartModal;
