"use client";

interface Part {
  id: string;
  reference: string;
  name: string;
  category: string;
  supplier: string;
  supplierId?: string;
  supplierName?: string;
  stock: number;
  minStock?: number;
  price: number;
  stockStatus: 'em_stock' | 'baixo_stock' | 'esgotado';
  margem_lucro?: number;
}

interface PartsTableProps {
  parts: Part[];
  onEdit?: (part: Part) => void;
  onReferenceClick?: (part: Part) => void;
}

const getCategoryLabel = (category: string) => {
  const categoryMap: { [key: string]: string } = {
    motor: "Motor",
    travoes: "Travões",
    suspensao: "Suspensão",
    transmissao: "Transmissão",
    "sistema-eletrico": "Sistema Elétrico",
    "sistema-arrefecimento": "Sistema de Arrefecimento",
    filtros: "Filtros",
    acessorios: "Acessórios",
    carrocaria: "Carroçaria",
    vidros: "Vidros",
    "pneus-rodas": "Pneus e Rodas",
    lubrificantes: "Lubrificantes",
    exaustao: "Exaustão",
    direcao: "Direção",
    "ar-condicionado": "Ar Condicionado"
  };
  return categoryMap[category] || category;
};

const getStockColor = (stockStatus: string, stock: number) => {
  switch (stockStatus) {
    case 'em_stock':
      return 'text-green-400';
    case 'baixo_stock':
      return 'text-yellow-400';
    case 'esgotado':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

// determina a classe de background da linha com base no stock
const getRowBgClass = (stockStatus: string, stock: number) => {
  // especial: se houver apenas uma unidade, destacamos com tom amarelado/laranja
  if (stock === 1) {
    return 'bg-yellow-800/30';
  }
  switch (stockStatus) {
    case 'baixo_stock':
      return 'bg-yellow-900/30';
    case 'esgotado':
      return 'bg-red-900/30';
    default:
      return '';
  }
};

export default function PartsTable({ parts, onEdit, onReferenceClick }: PartsTableProps) {
  return (
    <div className="bg-gray-700 border border-gray-600 rounded-none overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-gray-800 border-b border-gray-600">
            <tr>
              <th scope="col" className="px-6 py-3">Referência</th>
              <th scope="col" className="px-6 py-3">Nome da Peça</th>
              <th scope="col" className="px-6 py-3">Categoria</th>
              <th scope="col" className="px-6 py-3">Fornecedor</th>
              <th scope="col" className="px-6 py-3">Stock</th>
              <th scope="col" className="px-6 py-3 text-right">Preço Unit.</th>
              <th scope="col" className="px-6 py-3 text-right">Margem</th>
              <th scope="col" className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {parts.map((part) => (
              <tr key={part.id} className={`hover:bg-gray-600 transition-colors ${getRowBgClass(part.stockStatus, part.stock)}` }>
                <td className="px-6 py-4 font-medium text-gray-200 font-mono">
                  <button
                    className="underline text-brand-yellow hover:text-yellow-400 cursor-pointer"
                    onClick={() => onReferenceClick && onReferenceClick(part)}
                    title="Ver detalhes da peça"
                  >
                    {part.reference}
                  </button>
                </td>
                <td className="px-6 py-4 text-gray-100">{part.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-600">
                    {getCategoryLabel(part.category)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">{part.supplierName || part.supplier || '-'}</td>
                <td className="px-6 py-4 font-bold" style={{ color: getStockColor(part.stockStatus, part.stock).split(' ')[1] }}>
                  {part.stock} un.
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-200">
                  €{part.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-200">
                  {part.margem_lucro ? `${part.margem_lucro}%` : '-'}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => onEdit && onEdit(part)}
                    className="text-gray-400 hover:text-brand-yellow transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {parts.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-500">
                  Nenhuma peça encontrada com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
