import { NextResponse } from 'next/server';

/**
 * api-utils.ts - Utilitários para rotas API
 * 
 * Funções de ajuda para:
 * - Respostas padronizadas (sucesso/erro)
 * - Serialização de tipos especiais (BigInt, Decimal)
 * - Mapeamento de status de ordens de trabalho
 * - Detecção de erros de base de dados
 * - Parsing de parâmetros comuns (paginação, IDs)
 */

/**
 * Type para resposta de erro padronizada
 */
interface ApiErrorResponse {
  error: string;
  status: number;
}

/**
 * Serializa BigInt para Number recursivamente
 * 
 * MySQL BIGINT é retornado como BigInt em JS,
 * mas JSON.stringify não suporta BigInt nativamente.
 * Esta função converte para Number de forma segura.
 * 
 * NOTA: Perde precisão para números > Number.MAX_SAFE_INTEGER (2^53-1)
 * 
 * @param obj - Objeto, array, ou valor primitivo
 * @returns Objeto com BigInts convertidos para Number
 */
export const serializeBigInt = (obj: unknown): unknown => {
  if (typeof obj === 'bigint') return Number(obj);
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj === 'object' && obj !== null && 'toFixed' in obj) return Number(obj);
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>).reduce<Record<string, unknown>>(
      (acc, [key, value]) => ({
        ...acc,
        [key]: serializeBigInt(value)
      }),
      {}
    );
  }
  return obj;
};

/**
 * Cria resposta de sucesso padronizada
 * Serializa BigInt automaticamente antes de retornar JSON
 * 
 * @param data - Dados a retornar (objeto, array, primitivo)
 * @param status - HTTP status code (padrão: 200)
 * @returns NextResponse com JSON serializado
 */
export const successResponse = (data: unknown, status = 200) => {
  return NextResponse.json(serializeBigInt(data), { status });
};

/**
 * Cria resposta de erro padronizada
 * 
 * @param message - Mensagem de erro
 * @param status - HTTP status code (padrão: 500)
 * @returns NextResponse com erro formatado
 */
export const errorResponse = (message: string, status = 500): NextResponse<ApiErrorResponse> => {
  return NextResponse.json(
    { error: message, status },
    { status }
  );
};

/**
 * Verifica se erro é de base de dados offline
 * 
 * Detecta erros comuns:
 * - 'reach database server' - Erro de conexão com banco de dados
 * - 'ECONNREFUSED' - Porta do MySQL fechada
 * - 'ENOTFOUND' - Host não encontrado
 * 
 * @param error - Erro capturado
 * @returns true se é erro de DB offline
 */
export const isDatabaseOffline = (error: Error): boolean => {
  const message = error.message || String(error);
  return (
    message.includes('reach database server') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ENOTFOUND')
  );
};

/**
 * Handler padrão para erros de base de dados
 * 
 * Retorna:
 * - 503 Service Unavailable se DB offline
 * - 500 Internal Server Error para outros erros de DB
 * 
 * @param error - Erro capturado do try-catch
 * @returns NextResponse com erro apropriado
 */
export const handleDatabaseError = (error: Error) => {
  if (isDatabaseOffline(error)) {
    return errorResponse(
      'Database unavailable. Please start the database server and try again.',
      503 // Service Unavailable
    );
  }
  console.error('Database error:', error);
  return errorResponse('Database operation failed', 500);
};

/**
 * Extrai parâmetro 'id' de URL
 * Suporta string URL ou objeto URL
 * 
 * @param url - URL string ou objeto URL
 * @returns ID ou null se não existir
 */
export const extractId = (url: URL | string): string | null => {
  if (typeof url === 'string') {
    const urlObj = new URL(url, 'http://localhost');
    return urlObj.searchParams.get('id');
  }
  return url.searchParams.get('id');
};

/**
 * Parse parâmetros de paginação da URL
 * 
 * Query params:
 * - page: número da página (padrão: 1)
 * - limit: itens por página (padrão: 20)
 * 
 * Retorna:
 * - skip: quantos registos pular (para paginação)
 * - take: quantos registos retornar (para paginação)
 * 
 * @example
 * // URL: /api/items?page=2&limit=10
 * parsePaginationParams(url) // { skip: 10, take: 10 }
 */
export const parsePaginationParams = (url: URL) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  return { skip: (page - 1) * limit, take: limit };
};

/**
 * Mapeia status de Ordem de Trabalho: DB → Frontend
 * 
 * DB armazena em snake_case (em_aprovacao)
 * Frontend mostra em português legível (Em Aprovação)
 * 
 * @param status - Status do banco (snake_case)
 * @returns Status formatado para exibição
 */
export const mapDbStatusToFrontend = (status: string | null): string => {
  const statusMap: Record<string, string> = {
    'em_aprovacao': 'Em Aprovação',
    'aprovado': 'Aprovado',
    'aguarda_peca': 'Aguarda Peças',
    'em_andamento': 'Em Andamento',
    'concluido': 'Concluído',
    'entregue': 'Entregue',
    'cancelado': 'Cancelado'
  };
  return statusMap[status || ''] || 'Em Andamento';
};

/**
 * Mapeia status de Ordem de Trabalho: Frontend → DB
 * 
 * Frontend envia em português (Em Aprovação)
 * DB armazena em snake_case (em_aprovacao)
 * 
 * @param status - Status do frontend (português)
 * @returns Status em formato DB (snake_case)
 */
export const mapFrontendStatusToDb = (status: string): string => {
  const statusMap: Record<string, string> = {
    'Em Aprovação': 'em_aprovacao',
    'Aprovado': 'aprovado',
    'Aguarda Peças': 'aguarda_peca',
    'Aguardando Peças': 'aguarda_peca',
    'Em Andamento': 'em_andamento',
    'Concluído': 'concluido',
    'Concluída': 'concluido',
    'Entregue': 'entregue',
    'Cancelado': 'cancelado',
    'Cancelada': 'cancelado'
  };
  return statusMap[status] || status;
};

// Work Order Priority Mapping
export const mapPriority = (priority: string | null): string => {
  const priorityMap: Record<string, string> = {
    'baixa': 'Baixa',
    'alta': 'Alta',
    'urgente': 'Urgente'
  };
  return priorityMap[priority || ''] || 'Normal';
};

// Date utilities
export const toDateString = (date: Date | null): string | null => {
  return date ? date.toISOString() : null;
};

export const formatDatePt = (date: Date | null): string => {
  return date ? date.toLocaleDateString('pt-PT') : '';
};

// Calculate delay in days between two dates
export const calculateDaysDelay = (expectedDate: Date | null, realDate: Date | null, status: string): number => {
  if (!expectedDate) return 0;
  if (status === 'cancelado') return 0;
  
  const baseDate = realDate ?? new Date();
  const diffMs = baseDate.setHours(0, 0, 0, 0) - new Date(expectedDate).setHours(0, 0, 0, 0);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Parse numeric fields safely
export const parseNum = (value: unknown): number => {
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
};

// Build relational data maps for batch lookups
export const buildDataMap = <K extends PropertyKey, T extends Record<string, unknown>>(
  data: T[],
  keyField: keyof T
): Map<K, T> => {
  return new Map(
    data
      .map((item) => {
        const key = item[keyField];
        return key != null ? [key as K, item] : null;
      })
      .filter((entry): entry is [K, T] => entry !== null)
  );
};

// Extract unique IDs from array of objects
export const extractUniqueIds = <T extends Record<string, unknown>>(
  data: T[],
  field: keyof T
): Array<NonNullable<T[keyof T]>> => {
  return Array.from(new Set(
    data
      .map(item => item[field])
      .filter((v): v is NonNullable<T[keyof T]> => v != null)
  ));
};
