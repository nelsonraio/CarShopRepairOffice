import { NextResponse } from 'next/server';

// Endpoint para buscar faturas externas do TOConline
async function buscarFaturasExternas(token) {
  try {
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
    
    console.log('📡 Response status:', res.status);
    console.log('📡 Response ok:', res.ok);
    
    if (!res.ok) {
      return NextResponse.json({ error: data?.error || 'Erro ao buscar faturas externas', details: data }, { status: res.status });
    }
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET - para compatibilidade (query string)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  return buscarFaturasExternas(token);
}

// POST - forma segura de enviar token
export async function POST(req) {
  try {
    const { token } = await req.json();
    return buscarFaturasExternas(token);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
