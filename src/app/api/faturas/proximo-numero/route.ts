import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Simula API da TOQ Online - Obter próximo número de fatura
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        numero_fatura: null,
        message: 'Número de fatura é atribuído exclusivamente pelo TOConline.'
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


