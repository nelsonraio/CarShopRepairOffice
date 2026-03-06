'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Caminho para a página offline
 */
const OFFLINE_PATH = '/offline';

/**
 * OfflineGuard - Componente guardian para detectar e lidar com estado offline
 * 
 * Funcionalidades:
 * - Monitora a conectividade do navegador (navigator.onLine)
 * - Verifica periodicamente a saúde do servidor e base de dados via /api/health
 * - Redireciona automaticamente para /offline quando:
 *   1. Navegador perde conexão à internet
 *   2. Servidor não responde
 *   3. Base de dados está offline
 * - Executa verificações a cada 15 segundos
 * - Suporta eventos do browser (online/offline)
 * 
 * @returns null - Componente não renderiza nada visualmente
 */
export default function OfflineGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Se já estamos na página offline, não fazer nada
    if (pathname === OFFLINE_PATH) {
      return;
    }

    // Flag para evitar redirects após cleanup
    let disposed = false;

    /**
     * Redireciona para a página offline
     * Apenas executa se o componente não foi desmontado
     */
    const goOffline = () => {
      if (!disposed && pathname !== OFFLINE_PATH) {
        router.replace(OFFLINE_PATH);
      }
    };

    /**
     * Verifica o estado de saúde da aplicação
     * 1. Verifica se o navegador está online
     * 2. Faz pedido ao endpoint /api/health para verificar:
     *    - Se o servidor está a correr
     *    - Se a base de dados está acessível
     */
    const checkHealth = async () => {
      // Primeiro verifica conectividade do browser
      if (!navigator.onLine) {
        goOffline();
        return;
      }

      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          cache: 'no-store', // Sempre fazer pedido fresco, sem cache
        });

        // Se resposta não OK (status != 200), servidor ou DB offline
        if (!response.ok) {
          goOffline();
        }
      } catch {
        // Erro de rede = servidor offline
        goOffline();
      }
    };

    // Handler para evento offline do browser
    const handleOffline = () => goOffline();
    
    // Handler para evento online - verifica se servidor está realmente disponível
    const handleOnline = () => {
      void checkHealth();
    };

    // Registar listeners para eventos nativos do browser
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Verificação inicial ao montar o componente
    void checkHealth();
    
    // Verificação periódica a cada 15 segundos (15000ms)
    const intervalId = window.setInterval(() => {
      void checkHealth();
    }, 15000);

    // Cleanup quando componente é desmontado
    return () => {
      disposed = true; // Prevenir redirects após desmontagem
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      window.clearInterval(intervalId);
    };
  }, [pathname, router]);

  // Componente não renderiza nada - apenas efeito colateral
  return null;
}
