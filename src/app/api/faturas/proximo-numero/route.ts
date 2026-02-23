import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Simula API da TOQ Online - Obter próximo número de fatura
export async function GET(req: NextRequest) {
  try {
    const ano = new Date().getFullYear();
    
    // Encontrar última fatura do ano
    const ultimaFatura = await prisma.faturas.findMany({
      where: {
        numero_fatura: {
          startsWith: `FT ${ano}/`
        }
      },
      orderBy: { numero_fatura: 'desc' },
      take: 1
    });

    let proximo_numero = 1;
    const lastNumero = ultimaFatura[0]?.numero_fatura;
    if (lastNumero) {
      const parts = lastNumero.split('/');
      if (parts[1]) {
        proximo_numero = parseInt(parts[1]) + 1;
      }
    }

    const numero_fatura = `FT ${ano}/${String(proximo_numero).padStart(5, '0')}`;

    return NextResponse.json({
      success: true,
      data: {
        numero_fatura,
        ano,
        numero_sequencial: proximo_numero
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDbOffline =
      errorMessage.includes("reach database server") ||
      errorMessage.includes("ECONNREFUSED");

    if (isDbOffline) {
      return NextResponse.json(
        { error: "Database unavailable. Please start the database server and try again." },
        { status: 503 }
      );
    }
    console.error('Erro ao obter número de fatura:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao obter número de fatura' },
      { status: 500 }
    );
  }
}


