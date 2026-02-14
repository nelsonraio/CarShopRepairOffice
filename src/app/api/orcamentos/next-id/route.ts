import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const perfil = searchParams.get('perfil');

    if (!perfil) {
      return NextResponse.json({ error: 'Perfil is required' }, { status: 400 });
    }

    const year = new Date().getFullYear();
    let prefix: string;

    if (perfil === 'Empresa') {
      prefix = `OR-${year}-E`;
    } else if (perfil === 'TVDE_Interno' || perfil === 'TVDE_Externo' || perfil === 'TVDE Interno' || perfil === 'TVDE Externo') {
      prefix = `OR-${year}-TVDE`;
    } else {
      prefix = `OR-${year}-C`;
    }

    // Find the last budget ID with this prefix
    const lastBudget = await prisma.orcamentos.findFirst({
      where: {
        ref_orcamento: {
          startsWith: prefix
        }
      },
      orderBy: {
        ref_orcamento: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastBudget) {
      const lastRef = lastBudget.ref_orcamento;
      const numberPart = lastRef.substring(prefix.length);
      const lastNumber = parseInt(numberPart, 10);
      nextNumber = lastNumber + 1;
    }

    const nextId = `${prefix}${nextNumber.toString().padStart(4, '0')}`;

    return NextResponse.json({ nextId });
  } catch (error) {
    console.error('Error generating next budget ID:', error);
    return NextResponse.json({ error: 'Failed to generate next budget ID' }, { status: 500 });
  }
}
