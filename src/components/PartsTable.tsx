"use client";

interface Part {
  id: string;
  reference: string;
  name: string;
  category: string;
  supplier: string;
  stock: number;
  price: number;
  stockStatus: 'em_stock' | 'baixo_stock' | 'esgotado';
}

interface PartsTableProps {
  parts: Part[];
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

export default function PartsTable({ parts }: PartsTableProps) {
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
              <th scope="col" className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-gray-600 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-200 font-mono">{part.reference}</td>
                <td className="px-6 py-4 text-gray-100">{part.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-600">
                    {getCategoryLabel(part.category)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">{part.supplier}</td>
                <td className="px-6 py-4 font-bold" style={{ color: getStockColor(part.stockStatus, part.stock).split(' ')[1] }}>
                  {part.stock} un.
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-200">
                  €{part.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="text-gray-400 hover:text-brand-yellow transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {parts.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500">
                  Nenhuma peça encontrada com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gray-800 px-4 py-3 border-t border-gray-600 flex items-center justify-between sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">
              A mostrar <span className="font-medium text-gray-200">1</span> a <span className="font-medium text-gray-200">{parts.length}</span> de <span className="font-medium text-gray-200">{parts.length}</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
              <a href="#" className="relative inline-flex items-center px-2 py-2 border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                <span className="sr-only">Anterior</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" aria-current="page" className="z-10 bg-brand-yellow border-brand-yellow text-gray-900 relative inline-flex items-center px-4 py-2 border text-sm font-bold">1</a>
              <a href="#" className="bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 relative inline-flex items-center px-4 py-2 border text-sm font-medium">2</a>
              <a href="#" className="bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 relative inline-flex items-center px-4 py-2 border text-sm font-medium">3</a>
              <a href="#" className="relative inline-flex items-center px-2 py-2 border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                <span className="sr-only">Seguinte</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
