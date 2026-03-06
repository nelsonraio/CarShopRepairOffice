import { PrismaClient } from "@prisma/client";

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
 * Declaração global para Prisma Client singleton
 * Evita múltiplas instâncias em desenvolvimento (hot reload)
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Prisma Client singleton
 * Em desenvolvimento: reutiliza instância global
 * Em produção: cria nova instância
 */
const prisma: PrismaClient = global.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

/**
 * Chave padrão (vazia)
 * Nota: Não usar env vars - chave vem da tabela keystart
 */
const DEFAULT_KEY: string = '';

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
    // Busca registo mais recente
    const rec = await prisma.keystart.findFirst({ orderBy: { id: "desc" } });
    
    // Se nenhum registo, assume ativo
    if (!rec) {
      return { enabled: true, updatedAt: new Date().toISOString() };
    }
    
    // Converte ativo (boolean) para enabled, e timestamp para ISO string
    return { 
      enabled: !!rec.ativo, 
      updatedAt: rec.atualizado_em ? rec.atualizado_em.toISOString() : new Date().toISOString() 
    };
  } catch (error) {
    console.error("getAppStatus error:", error);
    // Em caso de erro, assume ativo (fail-open)
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
    const rec = await prisma.keystart.findFirst({ orderBy: { id: "desc" } });
    let updated;
    
    if (rec) {
      // Atualiza registo existente
      updated = await prisma.keystart.update({ 
        where: { id: rec.id }, 
        data: { ativo: enabled, atualizado_em: new Date() } 
      });
    } else {
      // Cria novo registo com chave vazia
      updated = await prisma.keystart.create({ 
        data: { chave: '', ativo: enabled, atualizado_em: new Date() } 
      });
    }
    
    return { 
      enabled: !!updated.ativo, 
      updatedAt: updated.atualizado_em ? updated.atualizado_em.toISOString() : new Date().toISOString() 
    };
  } catch (error) {
    console.error("setAppStatus error:", error);
    // Retorna estado solicitado mesmo em erro (melhor UX)
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
    // Busca registo com chave armazenada
    const rec = await prisma.keystart.findFirst({ orderBy: { id: "desc" } });
    
    // Se nenhum registo, chave inválida
    if (!rec) {
      return false;
    }
    
    // Comparação exata de string
    return key === rec.chave;
  } catch (error) {
    console.error("validateKey error:", error);
    // Em caso de erro, chave inválida (fail-closed para segurança)
    return false;
  }
}
