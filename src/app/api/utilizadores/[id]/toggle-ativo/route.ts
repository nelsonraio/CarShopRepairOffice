import { NextRequest, NextResponse } from 'next/server';
import { registarAuditoria } from '@/lib/auditoria';
import { db } from '@/db/connection';
import { utilizadores } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (Number.isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se utilizador existe
    const result = await db.select().from(utilizadores).where(eq(utilizadores.id, userId));
    const utilizador = result[0];
    if (!utilizador) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }

    // Alternar status (Drizzle espera number, não boolean)
    const novoAtivo = utilizador.ativo ? 0 : 1;
    await db.update(utilizadores)
      .set({ ativo: novoAtivo })
      .where(eq(utilizadores.id, userId));

    const atualizadoArr = await db.select().from(utilizadores).where(eq(utilizadores.id, userId));
    if (!atualizadoArr || atualizadoArr.length === 0) {
      return NextResponse.json({ error: 'Erro ao alternar status' }, { status: 500 });
    }
    const atualizado = atualizadoArr[0]!;

    await registarAuditoria('UPDATE', 'utilizadores', userId, { ativo: utilizador.ativo }, { ativo: atualizado.ativo }, request);

    return NextResponse.json({
      id: atualizado.id,
      nome_utilizador: atualizado.nomeUtilizador,
      email: atualizado.email,
      nome_completo: atualizado.nomeCompleto,
      papel: atualizado.papel,
      ativo: !!atualizado.ativo,
      criado_em: atualizado.criadoEm,
    });
  } catch (error) {
    console.error('Erro ao alternar status:', error);
    return NextResponse.json({ error: 'Erro ao alternar status' }, { status: 500 });
  }
}
