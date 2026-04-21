import { db } from '@/db/connection';
import { keystart } from '../../drizzle/migrations/schema';
import { desc, eq, sql } from 'drizzle-orm';

/**
 * appStatus.ts - Sistema de controlo de estado da aplicação
 * 
 * Gerencia estado enabled/disabled da aplicação baseado em licenças/pagamentos.
 * Estado armazenado na tabela `keystart` do MySQL.
 * 
 * Usado por:
 * - RootLayout para verificar se app deve estar disponível
 * - Sistema de licenças para ativar/desativar acesso
 * 
 * Tabela: keystart
 * Campos: id, chave (license key), ativo (boolean), atualizado_em (timestamp)
 */

/**
 * Interface para estado da aplicação
 */
export type AppStatus = {
  enabled: boolean; // Se aplicação está ativa
  updatedAt: string; // ISO timestamp da última atualização
};




/**
 * Chave padrão (vazia)
 * Nota: Não usar env vars - chave vem da tabela keystart
 */
const DEFAULT_KEY: string = '';

let keystartEnsured = false;

function isMissingTableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.toLowerCase().includes("doesn't exist") ||
    message.toLowerCase().includes('unknown table')
  );
}

async function ensureKeystartTable(): Promise<void> {
  if (keystartEnsured) return;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS keystart (
      id int NOT NULL AUTO_INCREMENT,
      chave varchar(255),
      ativo tinyint NOT NULL DEFAULT 1,
      atualizado_em timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )
  `);

  keystartEnsured = true;
}

async function getLatestKeystartRecord() {
  try {
    return await db.select().from(keystart).orderBy(desc(keystart.id)).limit(1);
  } catch (error) {
    if (isMissingTableError(error)) {
      await ensureKeystartTable();
      return await db.select().from(keystart).orderBy(desc(keystart.id)).limit(1);
    }
    throw error;
  }
}

/**
 * Lê estado atual da aplicação da base de dados
 * 
 * Processo:
 * 1. Busca registo mais recente da tabela keystart (ORDER BY id DESC)
 * 2. Retorna campo 'ativo' como enabled
 * 3. Retorna timestamp de atualização
 * 
 * Fallback:
 * - Se tabela vazia: retorna { enabled: true } (app ativa por padrão)
 * - Se erro de DB: retorna { enabled: true } (fail-open para evitar lock-out)
 * 
 * IMPORTANTE: Não usa cache - sempre consulta DB
 * Garante estado atual mesmo em ambientes distribuídos
 * 
 * @returns Estado da aplicação com enabled e updatedAt
 */
export async function getAppStatus(): Promise<AppStatus> {
  try {
    // Busca o registro mais recente da tabela keystart (ORDER BY id DESC LIMIT 1)
    const recs = await getLatestKeystartRecord();
    const rec = recs[0];

    if (!rec) {
      return { enabled: true, updatedAt: new Date().toISOString() };
    }

    return {
      enabled: !!rec.ativo,
      updatedAt: rec.atualizadoEm ? new Date(rec.atualizadoEm).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error('getAppStatus error:', error);
    return { enabled: true, updatedAt: new Date().toISOString() };
  }
}

/**
 * Define estado da aplicação (ativa/inativa)
 * 
 * Processo:
 * 1. Busca registo mais recente da tabela keystart
 * 2. Se existe: atualiza (UPDATE)
 * 3. Se não existe: cria novo (CREATE) com chave vazia
 * 4. Atualiza timestamp atualizado_em
 * 5. Retorna novo estado
 * 
 * Uso:
 * - Sistema de pagamentos para desativar app em falta de pagamento
 * - Admin para ativar/desativar manualmente
 * - Scripts de manutenção
 * 
 * @param enabled - true para ativar, false para desativar
 * @returns Novo estado da aplicação
 */
export async function setAppStatus(enabled: boolean): Promise<AppStatus> {
  try {
    // Busca registo existente
    const [rec] = await getLatestKeystartRecord();
    let updated;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' '); // formato datetime MySQL
    const ativoValue = enabled ? 1 : 0;

    if (rec) {
      await db
        .update(keystart)
        .set({ ativo: ativoValue, atualizadoEm: now })
        .where(eq(keystart.id, rec.id));
      updated = { ...rec, ativo: ativoValue, atualizadoEm: now };
    } else {
      await db
        .insert(keystart)
        .values({ chave: '', ativo: ativoValue, atualizadoEm: now });
      updated = { ativo: ativoValue, atualizadoEm: now };
    }

    return {
      enabled: !!updated.ativo,
      updatedAt: updated.atualizadoEm ? new Date(updated.atualizadoEm).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error('setAppStatus error:', error);
    return { enabled, updatedAt: new Date().toISOString() };
  }
}

/**
 * Valida chave de licença contra a chave armazenada
 * 
 * Processo:
 * 1. Busca registo mais recente da tabela keystart
 * 2. Compara chave fornecida com chave armazenada (campo 'chave')
 * 3. Retorna true se match exato, false caso contrário
 * 
 * Segurança:
 * - Comparação simples de string (===)
 * - TODO: Implementar comparação segura contra timing attacks
 * - TODO: Hash/criptografia da chave em produção
 * 
 * Fallback:
 * - Se nenhum registo: retorna false (sem chave = inválido)
 * - Se erro de DB: retorna false (fail-closed para segurança)
 * 
 * @param key - Chave de licença a validar (opcional)
 * @returns true se válida, false se inválida ou erro
 */
export async function validateKey(key?: string): Promise<boolean> {
  try {
    // Busca registo mais recente
    const [rec] = await getLatestKeystartRecord();
    if (!rec) {
      return false;
    }
    return key === rec.chave;
  } catch (error) {
    console.error("validateKey error:", error);
    return false;
  }
}
