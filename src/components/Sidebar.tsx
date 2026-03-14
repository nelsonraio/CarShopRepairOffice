'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

/**
 * Props para o componente Sidebar
 */
interface SidebarProps {
  activePage?: string; // Identifica página atual para highlight
}

/**
 * Sidebar - Menu de navegação lateral da aplicação
 * 
 * Funcionalidades:
 * - Logo e nome da aplicação no topo
 * - Links de navegação para todas as páginas principais
 * - Highlight visual da página ativa
 * - Ícones SVG para cada secção
 * - Estilo dark theme consistente
 * 
 * Páginas disponíveis:
 * - Quadro da Oficina (Kanban)
 * - Agenda
 * - Clientes
 * - Veículos
 * - Orçamentos
 * - Ordens de Trabalho
 * - Peças
 * - Faturação (TOConline)
 * - Balanço
 * - Tabelas (Configurações)
 * 
 * @param activePage - Nome da página ativa para highlight (default: 'dashboard')
 */
const Sidebar: React.FC<SidebarProps> = ({ activePage = 'dashboard' }) => {
  const router = useRouter();
  const [userPapel, setUserPapel] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('/api/utilizadores/me');
        if (res.ok) {
          const data = await res.json();
          setUserPapel(data.papel);
        }
      } catch {}
    }
    fetchMe();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/utilizadores/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      router.push('/login');
    }
  };

  // Menu links
  const menuLinks = [
    {
      href: '/kanban',
      label: 'Quadro da Oficina',
      icon: (
        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="5" width="7" height="14" rx="2"/><rect x="14" y="5" width="7" height="7" rx="2"/></svg>
      ),
      active: activePage === 'kanban',
    },
    {
      href: '/agenda',
      label: 'Agenda',
      icon: (
        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      ),
      active: activePage === 'agenda',
    },
    {
      href: '/clientes',
      label: 'Clientes',
      icon: (
        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
      ),
      active: activePage === 'clientes',
    },
    {
      href: '/veiculos',
      label: 'Veiculos',
      icon: (
        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v3.28a1 1 0 00.684.948l6 1.925A6.002 6.002 0 0019 17Z"/></svg>
      ),
      active: activePage === 'veiculos',
    },
    {
      href: '/orcamentos',
      label: 'Orcamentos',
      icon: (
        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
      ),
      active: activePage === 'orcamentos',
    },
    {
      href: '/ordens-trabalho',
      label: 'Ordens de Trabalho',
      icon: (
        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
      ),
      active: activePage === 'ordens-trabalho',
    },
    {
      href: '/pecas',
      label: 'Pecas',
      icon: (
        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
      ),
      active: activePage === 'pecas',
    },
    {
      href: '/faturacao',
      label: 'Faturacao Externa (TOConline)',
      icon: (
        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      ),
      active: activePage === 'faturacao',
    },
    {
      href: '/balanco',
      label: 'Balanco',
      icon: (
        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
      ),
      active: activePage === 'balanco',
    },
  ];

  if (userPapel === 'admin') {
    menuLinks.push({
      href: '/tabelas',
      label: 'Tabelas',
      icon: (
        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      ),
      active: activePage === 'tabelas',
    });
  }

  // Mobile menu overlay
  return (
    <>
      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          aria-label="Abrir menu"
          className="p-2 rounded bg-gray-900 border border-gray-700 text-white shadow-lg"
          onClick={() => setMobileOpen(true)}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="bg-gray-900 w-72 max-w-full h-full flex flex-col border-r border-gray-700 animate-slideInLeft">
            <div className="h-16 flex items-center justify-between border-b border-gray-700 px-4">
              <div className="flex items-center space-x-2">
                <img src="/logo.png" alt="MQAuto Logo" className="w-12 h-12 object-contain" />
                <h1 className="text-xl font-bold text-white">MQAuto</h1>
              </div>
              <button aria-label="Fechar menu" className="p-2 text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto mt-4">
              {menuLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-6 py-3 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-brand-yellow-light transition-colors duration-150 ${link.active ? 'text-white bg-gray-800 font-semibold' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-700 p-4">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-6 py-3 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-red-400 transition-colors duration-150 rounded"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sair
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black bg-opacity-40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-gray-900 border-r border-gray-700 flex-col h-screen">
        <div className="h-16 flex items-center justify-start border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="MQAuto Logo" className="w-12 h-12 object-contain" />
            <h1 className="text-xl font-bold text-white">MQAuto</h1>
          </div>
        </div>
        <nav className="mt-6 flex-1 overflow-y-auto">
          {menuLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-6 py-3 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-brand-yellow-light transition-colors duration-150 ${link.active ? 'text-white bg-gray-800 font-semibold' : ''}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-700 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-red-400 transition-colors duration-150 rounded"
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
