
import { NextResponse } from 'next/server';

const BASE_URL = 'https://api7.toconline.pt';
const CLIENT_ID = 'pt999999990_c101423-6604ef0f5744561b';
const CLIENT_SECRET = '8f753cea78d995b5b6c877933495bf2b';
const OAUTH_URL = 'https://app7.toconline.pt/oauth';
const REDIRECT_URI = 'https://oauth.pstmn.io/v1/callback';
const SCOPE = 'commercial';

async function getOAuthToken(code) {
  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${OAUTH_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${basicAuth}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      scope: SCOPE
    })
  });
  const json = await res.json();
  if (!json.access_token) throw new Error('Falha ao obter access_token: ' + JSON.stringify(json));
  return json.access_token;
}

export async function POST(req) {
  try {
    const { token } = await req.json();
    if (!token) throw new Error('Código de autorização não fornecido.');
    const accessToken = await getOAuthToken(token);
    const response = await fetch(`${BASE_URL}/api/products`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    const text = await response.text();
    if (!response.ok) {
      return new Response(text, { status: response.status });
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = undefined;
    }
    // Extrai apenas os campos relevantes
    const produtos = (data?.data || []).map(produto => ({
      id_interno: produto.id,
      codigo_externo: produto.attributes?.item_code,
      descricao: produto.attributes?.description
    }));
    return new Response(JSON.stringify(produtos), { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
