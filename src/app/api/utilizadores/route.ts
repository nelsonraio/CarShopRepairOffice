import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { registarAuditoria } from '@/lib/auditoria';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const utilizadores = await prisma.utilizadores.findMany({
      select: {
        id: true,
        nome_utilizador: true,
        email: true,
        nome_completo: true,
        papel: true,
        ativo: true,
        ultimo_login: true,
        criado_em: true,
      },
      orderBy: { nome_utilizador: 'asc' },
    });

    return NextResponse.json(utilizadores);
  } catch (error) {
    console.error('Erro ao listar utilizadores:', error);
    return NextResponse.json({ error: 'Erro ao listar utilizadores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome_utilizador, email, nome_completo, papel, hash_palavra_passe } = body;

    // Validar campos obrigatórios
    if (!nome_utilizador || !email || !nome_completo || !hash_palavra_passe) {
      return NextResponse.json(
        { error: 'Campos obrigatórios em falta' },
        { status: 400 }
      );
    }

    // Validar papéis
    const papeisValidos = ['admin', 'gestor', 'mecanico', 'rececionista'];
    if (!papeisValidos.includes(papel)) {
      return NextResponse.json(
        { error: 'Papel inválido' },
        { status: 400 }
      );
    }

    // Verificar se utilizador já existe
    const existente = await prisma.utilizadores.findFirst({
      where: {
        OR: [
          { nome_utilizador },
          { email },
        ],
      },
    });

    if (existente) {
      return NextResponse.json(
        { error: 'Nome de utilizador ou email já existe' },
        { status: 409 }
      );
    }

    // Hash da palavra-passe
    const hashedPassword = await bcrypt.hash(hash_palavra_passe, 10);

    // Criar utilizador
    const novoUtilizador = await prisma.utilizadores.create({
      data: {
        nome_utilizador,
        email,
        nome_completo,
        papel: papel as any,
        hash_palavra_passe: hashedPassword,
        ativo: true,
      },
      select: {
        id: true,
        nome_utilizador: true,
        email: true,
        nome_completo: true,
        papel: true,
        ativo: true,
        criado_em: true,
      },
    });

    await registarAuditoria('CREATE', 'utilizadores', novoUtilizador.id, null, { nome_utilizador, email, papel }, request);

    return NextResponse.json(novoUtilizador, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar utilizador:', error);
    return NextResponse.json({ error: 'Erro ao criar utilizador' }, { status: 500 });
  }
}
