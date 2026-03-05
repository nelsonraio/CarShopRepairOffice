
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
    const { payload, authCode, percentual_imposto, subtotal, valor_desconto } = await req.json();
    if (!authCode) throw new Error('Código de autorização não fornecido.');
    const token = await getOAuthToken(authCode);
    // Se não há payload, só retorna o token
    if (!payload || Object.keys(payload).length === 0) {
      return NextResponse.json({ success: true, data: { access_token: token } });
    }
    // Caso contrário, cria fatura normalmente
    const res = await fetch(`${BASE_URL}/api/v1/commercial_sales_documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data?.data?.id) {
      let localError = null;
      try {
        const faturaOnline = data.data;
        
        // Calcular valor_imposto em euros a partir da percentagem
        const valorImpostoEmEuros = subtotal ? (subtotal * percentual_imposto / 100) : 0;
        
        // Buscar cliente pelo nome
        const nomeCliente = faturaOnline.attributes.customer_business_name || 'Consumidor Final';
        let cliente = await prisma.clientes.findFirst({
          where: { nome: nomeCliente }
        });
        if (!cliente) {
          // Criar cliente se não existir
          cliente = await prisma.clientes.create({
            data: {
              nome: nomeCliente,
              nif: faturaOnline.attributes.customer_tax_registration_number || '',
              endereco: faturaOnline.attributes.customer_address_detail || '',
              telefone: '',
              email: '',
              perfil: 'Normal'
            }
          });
        }
        const valorDesconto = parseFloat(valor_desconto) || 0;
        const valorSubtotal = parseFloat(subtotal) || 0;
        const valorImpostoRounded = Math.round(valorImpostoEmEuros * 100) / 100;
        const valorTotalCalculado = valorSubtotal + valorImpostoRounded - valorDesconto;

        const faturaLocal = await prisma.faturas.create({
          data: {
            numero_fatura: faturaOnline.attributes.document_number,
            cliente_id: cliente.id,
            ordem_trabalho_id: null,
            data_emissao: faturaOnline.attributes.date,
            data_vencimento: faturaOnline.attributes.due_date,
            subtotal: valorSubtotal,
            valor_imposto: valorImpostoRounded,
            valor_desconto: valorDesconto,
            valor_total: valorTotalCalculado,
            estado: faturaOnline.attributes.status || 'pendente',
            notas: faturaOnline.attributes.notes || '',
            valor_pago: 0
          }
        });
      } catch (err) {
        localError = err.message || String(err);
        console.error('Erro ao gravar fatura local:', err);
      }
      console.log('Resposta TOConline:', JSON.stringify(data));
      return NextResponse.json({ success: true, data, localError });
    } else {
      return NextResponse.json({ error: data?.error || 'Erro ao criar fatura', details: data }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
