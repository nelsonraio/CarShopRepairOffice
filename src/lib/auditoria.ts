import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import type { JWTPayload } from 'jose';
import { db } from '@/db/connection';
import { logAuditoria } from '../../drizzle/migrations/schema';
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

interface UserPayload extends JWTPayload {
  id: number;
  nome_utilizador: string;
}

/**
 * Obtém o ID do utilizador autenticado a partir do cookie JWT.
 * Retorna null se não autenticado.
 */
async function getUserId(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    const { payload } = await jwtVerify<UserPayload>(token, secret, { algorithms: ['HS256'] });
    return payload.id;
  } catch {
    return null;
  }
}

/**
 * Regista uma ação no log de auditoria.
 *
 * @param acao - Tipo de ação (ex: 'CREATE', 'UPDATE', 'DELETE', 'LOGIN')
 * @param nome_tabela - Nome da tabela afetada (ex: 'clientes', 'veiculos')
 * @param id_registo - ID do registo afetado (opcional)
 * @param valores_antigos - Valores antes da alteração (opcional)
 * @param valores_novos - Valores após a alteração (opcional)
 * @param request - NextRequest para extrair IP e user-agent (opcional)
 */
export async function registarAuditoria(
  acao: string,
  nome_tabela?: string,
  id_registo?: number,
  valores_antigos?: Record<string, unknown> | null,
  valores_novos?: Record<string, unknown> | null,
  request?: Request
) {
  try {
    const utilizador_id = await getUserId();

    let endereco_ip: string | null = null;
    let agente_utilizador: string | null = null;

    if (request) {
      endereco_ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        null;
      agente_utilizador = request.headers.get('user-agent') || null;
    }

    await db.insert(logAuditoria).values({
      utilizadorId: utilizador_id,
      acao,
      nomeTabela: nome_tabela || null,
      idRegisto: id_registo || null,
      valoresAntigos: valores_antigos ? JSON.parse(JSON.stringify(valores_antigos)) : undefined,
      valoresNovos: valores_novos ? JSON.parse(JSON.stringify(valores_novos)) : undefined,
      enderecoIp: endereco_ip,
      agenteUtilizador: agente_utilizador,
    });
  } catch (error) {
    // Nunca bloquear a operação principal por falha no log
    console.error('Erro ao registar auditoria:', error);
  }
}
