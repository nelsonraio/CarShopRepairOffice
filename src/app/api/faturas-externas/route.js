import { NextResponse } from 'next/server';

// Endpoint para buscar faturas externas do TOConline
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Token OAuth2 não fornecido.' }, { status: 400 });

    // Busca faturas do TOConline
    const res = await fetch('https://api7.toconline.pt/api/v1/commercial_sales_documents', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data?.error || 'Erro ao buscar faturas externas', details: data }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
