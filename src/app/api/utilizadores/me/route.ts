import { getJwtPayload } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/utilizadores/me
 * Devolve os dados do utilizador autenticado
 */
export async function GET() {
  try {
    const payload = await getJwtPayload();

    if (!payload) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: payload.id,
      email: payload.email,
      nome_completo: payload.nome_completo,
      nome_utilizador: payload.nome_utilizador,
      papel: payload.papel,
    });
  } catch (error) {
    console.error("Erro ao obter utilizador:", error);
    return NextResponse.json(
      { error: "Erro ao obter utilizador" },
      { status: 500 }
    );
  }
}
