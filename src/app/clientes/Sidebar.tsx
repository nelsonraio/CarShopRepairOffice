"use client";

import Link from 'next/link';

// Este é um componente de ícone genérico para demonstração.
// Substitua pelos seus ícones SVG ou de uma biblioteca como lucide-react.
const Icon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
  </svg>
);

const navItems = [
    { href: '/dashboard', label: 'Dashboard', page: 'dashboard' },
    { href: '/agenda', label: 'Agenda', page: 'agenda' },
    { href: '/kanban', label: 'Quadro da Oficina', page: 'kanban' },
    { href: '/clientes', label: 'Clientes', page: 'clientes' },
    { href: '/veiculos', label: 'Veículos', page: 'veiculos' },
    { href: '/pecas', label: 'Peças', page: 'pecas' },
    { href: '/orcamentos', label: 'Orçamentos', page: 'orcamentos' },
    { href: '/faturacao', label: 'Faturação', page: 'faturacao' },
    { href: '/balanco', label: 'Balanço', page: 'balanco' },
    { href: '/configuracoes', label: 'Configurações', page: 'configuracoes' },
];

interface SidebarProps {
  activePage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-700">
        <div className="h-16 flex items-center justify-start border-b border-gray-700 px-4">
            <div className="flex items-center space-x-2">
                <img src="/Oficina Automóvel.png" alt="MQAuto Logo" className="w-12 h-12 object-contain" />
                <h1 className="text-xl font-bold text-white">MQAuto</h1>
            </div>
        </div>
        <nav className="mt-6">
            {navItems.map(item => {
                const isActive = activePage === item.page;
                
                // O estilo do item ativo foi ajustado para maior contraste e clareza.
                // Em vez de um fundo que se confunde com o resto da página,
                // usamos uma borda lateral amarela e um texto mais claro.
                const baseClasses = "flex items-center py-3 text-base transition-colors duration-150 rounded-none";
                const activeClasses = "bg-gray-800 text-white font-semibold border-l-4 border-brand-yellow pl-5 pr-6";
                const inactiveClasses = "text-gray-400 font-medium hover:bg-gray-700 hover:text-brand-yellow-light px-6";

                const linkClasses = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;

                return (
                    <Link href={item.href} key={item.href} className={linkClasses}>
                        {/* Substituir pelo seu componente de ícone real */}
                        <Icon className="w-6 h-6 mr-3" />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    </aside>
  );
};

export default Sidebar;