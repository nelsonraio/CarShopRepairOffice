'use client';

import { useRouter } from 'next/navigation';

/**
 * Página Offline - Exibida quando sistema está indisponível
 * 
 * Situações que levam a esta página:
 * 1. Navegador sem internet (navigator.onLine = false)
 * 2. Servidor Next.js não responde
 * 3. Base de dados MySQL offline ou inatingível
 * 
 * Funcionalidades:
 * - Botão "Tentar Novamente" que verifica /api/health
 * - Se health check passar, redireciona para página inicial
 * - Se falhar, mostra alerta para tentar novamente
 * 
 * Redirecionamento automático:
 * - OfflineGuard redireciona para cá quando detecta problemas
 * - Ao restaurar conectividade, user pode voltar manualmente
 */
export default function OfflinePage() {
  const router = useRouter();

  /**
   * Tenta reconectar verificando saúde do sistema
   * 
   * Processo:
   * 1. Faz pedido a /api/health (sem cache)
   * 2. Se OK (200): redireciona para home e refresh
   * 3. Se falhar: mantém na página e mostra alerta
   */
  const handleRetry = async () => {
    try {
      const response = await fetch('/api/health', { cache: 'no-store' });
      if (response.ok) {
        router.push('/');
        router.refresh(); // Force reload para garantir dados frescos
        return;
      }
    } catch {
      // Mantém usuário na página offline quando health check falha
    }

    alert('Sistema ainda indisponivel. Tente novamente em alguns segundos.');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full border border-gray-700 bg-gray-800 p-8">
        <h1 className="text-3xl font-bold">Sistema Offline</h1>
        <p className="mt-4 text-gray-300">
          A aplicacao esta temporariamente indisponivel.
          Verifique a ligacao a internet e confirme que os servicos (API e base de dados) estao ativos.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors"
          >
            Tentar Novamente
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-700 text-gray-100 hover:bg-gray-600 transition-colors"
          >
            Ir para Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
