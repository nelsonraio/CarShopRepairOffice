"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function OAuthCallback() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('A processar...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('🔍 Callback recebido:', {
      code: code ? code.substring(0, 20) + '...' : null,
      error,
      errorDescription,
      allParams: Object.fromEntries(searchParams)
    });

    if (code) {
      setStatus('✅ Código capturado! A guardar...');
      
      // Guardar o código no localStorage para a janela pai ler
      localStorage.setItem('toconline_auth_code', code);
      localStorage.setItem('toconline_auth_timestamp', new Date().toISOString());
      
      console.log('💾 Código salvo em localStorage');
      
      // Notificar a janela principal através de postMessage (se existir)
      if (window.opener) {
        console.log('📤 Enviando postMessage para janela principal...');
        try {
          window.opener.postMessage(
            {
              type: 'OAUTH_CODE_RECEIVED',
              code: code,
              timestamp: new Date().toISOString()
            },
            window.location.origin
          );
          console.log('✅ postMessage enviada');
        } catch (e) {
          console.warn('⚠️ Erro ao enviar postMessage:', e);
        }
      } else {
        console.log('⚠️ Não há janela opener (window.opener não existe)');
      }
      
      // Fechar a janela popup após um pequeno delay
      setTimeout(() => {
        console.log('🪟 Fechando popup...');
        setStatus('✅ Autorização completa! Janela a fechar...');
        window.close();
      }, 1000);
    } else if (error) {
      setStatus(`❌ Erro: ${error}\n${errorDescription || ''}`);
      console.error('❌ Erro OAuth:', { error, errorDescription });
      
      // Guardar erro em localStorage
      localStorage.setItem('toconline_auth_error', error);
      localStorage.setItem('toconline_auth_error_description', errorDescription || '');
      
      // Notificar erro
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'OAUTH_ERROR',
            error: error,
            errorDescription: errorDescription,
            timestamp: new Date().toISOString()
          },
          window.location.origin
        );
      }
      
      setTimeout(() => {
        window.close();
      }, 3000);
    } else {
      setStatus('⚠️ Nenhum parâmetro recebido');
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="text-center max-w-md p-6">
        <div className="inline-block mb-4">
          {status.includes('✅') ? (
            <div className="text-5xl">✅</div>
          ) : status.includes('❌') ? (
            <div className="text-5xl">❌</div>
          ) : (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
          )}
        </div>
        <h1 className="text-white text-2xl font-bold mb-3 whitespace-pre-wrap">{status}</h1>
        <p className="text-gray-400 text-sm">
          {status.includes('❌') ? 'Verifique a consola do navegador para detalhes' : 'Esta janela fechará automaticamente'}
        </p>
      </div>
    </div>
  );
}
