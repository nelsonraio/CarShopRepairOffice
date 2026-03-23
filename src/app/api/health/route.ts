import { NextResponse } from 'next/server';
import { db } from '@/db/connection';

/**
 * GET /api/health
 * Endpoint de verificação de saúde da aplicação
 * 
 * Verifica:
 * - Se o servidor Next.js está a correr (se este endpoint responde)
 * - Se a base de dados MySQL está acessível (via query simples)
 * 
 * Retorna:
 * - 200 OK: Sistema saudável, DB conectada
 * - 503 Service Unavailable: DB offline ou erro de conexão
 * 
 * Usado por:
 * - OfflineGuard para monitorização contínua
 * - Página /offline para testar reconexão
 * 
 * @returns JSON com status e timestamp ou mensagem de erro
 */
export async function GET() {
  try {

    // Query simples para verificar conectividade à DB
    await db.execute('SELECT 1');

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown health check error';

    // Status 503 = Service Unavailable (temporariamente indisponível)
    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 503 }
    );
  }
}
