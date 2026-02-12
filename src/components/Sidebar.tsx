import Link from 'next/link';

interface SidebarProps {
  activePage?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage = 'dashboard' }) => {
  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-700">
      <div className="h-16 flex items-center justify-start border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="MQAuto Logo" className="w-12 h-12 object-contain" />
          <h1 className="text-xl font-bold text-white">MQAuto</h1>
        </div>
      </div>
      <nav className="mt-6">
        <Link href="/" className={`flex items-center px-6 py-3 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-brand-yellow-light transition-colors duration-150 ${activePage === 'dashboard' ? 'text-white bg-gray-800 font-semibold' : ''}`}>
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
          Dashboard
        </Link>
        <Link href="/agenda" className={`flex items-center px-6 py-3 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-brand-yellow-light transition-colors duration-150 ${activePage === 'agenda' ? 'text-white bg-gray-800 font-semibold' : ''}`}>
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Agenda
        </Link>
        <Link href="/clientes" className={`flex items-center px-6 py-3 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-brand-yellow-light transition-colors duration-150 ${activePage === 'clientes' ? 'text-white bg-gray-800 font-semibold' : ''}`}>
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          Clientes
        </Link>
        <Link href="/veiculos" className={`flex items-center px-6 py-3 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-brand-yellow-light transition-colors duration-150 ${activePage === 'veiculos' ? 'text-white bg-gray-800 font-semibold' : ''}`}>
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v3.28a1 1 0 00.684.948l6 1.925A6.002 6.002 0 0019 17Z"></path>
          </svg>
          Veículos
        </Link>
        <Link href="/orcamentos" className={`flex items-center px-6 py-3 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-brand-yellow-light transition-colors duration-150 ${activePage === 'orcamentos' ? 'text-white bg-gray-800 font-semibold' : ''}`}>
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          Orçamentos
        </Link>
        <Link href="/ordens-trabalho" className={`flex items-center px-6 py-3 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-brand-yellow-light transition-colors duration-150 ${activePage === 'ordens-trabalho' ? 'text-white bg-gray-800 font-semibold' : ''}`}>
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
          </svg>
          Ordens de Trabalho
        </Link>
        
        <Link href="/kanban" className={`flex items-center px-6 py-3 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-brand-yellow-light transition-colors duration-150 ${activePage === 'kanban' ? 'text-white bg-gray-800 font-semibold' : ''}`}>
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
          </svg>
          Quadro da Oficina
        </Link>
        <Link href="/pecas" className={`flex items-center px-6 py-3 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-brand-yellow-light transition-colors duration-150 ${activePage === 'pecas' ? 'text-white bg-gray-800 font-semibold' : ''}`}>
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          Peças
        </Link>
        <Link href="/faturacao" className={`flex items-center px-6 py-3 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-brand-yellow-light transition-colors duration-150 ${activePage === 'faturacao' ? 'text-white bg-gray-800 font-semibold' : ''}`}>
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Faturação
        </Link>
        <Link href="/balanco" className={`flex items-center px-6 py-3 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-brand-yellow-light transition-colors duration-150 ${activePage === 'balanco' ? 'text-white bg-gray-800 font-semibold' : ''}`}>
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          Balanço
        </Link>
        <Link href="/tabelas" className={`flex items-center px-6 py-3 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-brand-yellow-light transition-colors duration-150 ${activePage === 'tabelas' ? 'text-white bg-gray-800 font-semibold' : ''}`}>
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          Tabelas
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
