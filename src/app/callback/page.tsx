"use client";

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);
  const [status, setStatus] = useState('A processar autenticacao TOConline...');

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    hasProcessed.current = true;

    const finishWithRedirect = (target: string) => {
      if (window.opener && !window.opener.closed) {
        window.opener.location.href = target;
        window.close();
        return;
      }

      window.location.replace(target);
    };

    const notifyOpener = (payload: Record<string, string>) => {
      if (!window.opener || window.opener.closed) {
        return;
      }

      try {
        window.opener.postMessage(payload, window.location.origin);
      } catch (error) {
        console.warn('Falha ao notificar janela principal do OAuth.', error);
      }
    };

    const run = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      const redirectUri = isLocalhost
        ? `${window.location.origin}/callback`
        : (process.env.NEXT_PUBLIC_REDIRECT_URI || `${window.location.origin}/callback`);

      if (error) {
        const reason = errorDescription || error;
        localStorage.setItem('toconline_auth_error_reason', reason);
        notifyOpener({
          type: 'OAUTH_ERROR',
          error,
          errorDescription: reason,
        });
        setStatus('Falha na autenticacao. A regressar a faturacao...');
        finishWithRedirect(`/faturacao?auth=error&reason=${encodeURIComponent(reason)}`);
        return;
      }

      if (!code) {
        const reason = 'code ausente no callback';
        localStorage.setItem('toconline_auth_error_reason', reason);
        notifyOpener({
          type: 'OAUTH_ERROR',
          error: 'missing_code',
          errorDescription: reason,
        });
        setStatus('Callback invalido. A regressar a faturacao...');
        finishWithRedirect(`/faturacao?auth=error&reason=${encodeURIComponent(reason)}`);
        return;
      }

      try {
        setStatus('A trocar codigo por token de acesso...');

        const response = await fetch('/api/fatura-simplificada', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload: {}, authCode: code, redirectUri })
        });

        const data = await response.json();
        const token = data?.data?.access_token;

        if (!response.ok || !data?.success || !token) {
          const reason =
            data?.error ||
            data?.details?.error ||
            `Falha ao obter access token (HTTP ${response.status}).`;
          throw new Error(reason);
        }

        localStorage.setItem('toconline_access_token', token);
        localStorage.setItem('toconline_token_timestamp', Date.now().toString());
        localStorage.removeItem('toconline_auth_error_reason');
        localStorage.setItem('toconline_auth_code', code);
        localStorage.setItem('toconline_auth_timestamp', new Date().toISOString());

        notifyOpener({
          type: 'OAUTH_CODE_RECEIVED',
          code,
          timestamp: new Date().toISOString(),
        });

        setStatus('Autenticacao concluida. A regressar a faturacao...');
        finishWithRedirect('/faturacao?auth=success');
      } catch (err) {
        const reason = err instanceof Error ? err.message : 'Erro na autenticacao.';
        localStorage.setItem('toconline_auth_error_reason', reason);
        notifyOpener({
          type: 'OAUTH_ERROR',
          error: 'token_exchange_failed',
          errorDescription: reason,
        });
        setStatus('Erro ao concluir autenticacao. A regressar a faturacao...');
        finishWithRedirect(`/faturacao?auth=error&reason=${encodeURIComponent(reason)}`);
      }
    };

    run();
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-slate-950/50">
        <div className="mb-5 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-amber-400" />
        <h1 className="text-2xl font-semibold mb-3">Autenticacao TOConline</h1>
        <p className="text-slate-300">{status}</p>
      </div>
    </main>
  );
}
