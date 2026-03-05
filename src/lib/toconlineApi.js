// Função para criar fatura simplificada (FS)
export async function criarFaturaSimplificada(token, faturaData = {}) {
  const body = {
    data: {
      type: 'commercial_sales_documents',
      attributes: {
        document_type: 'FS',
        date: faturaData.date || new Date().toISOString().slice(0, 10),
        due_date: faturaData.due_date || new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 10),
        notes: faturaData.notes || 'Fatura simplificada via API',
        currency_iso_code: 'EUR',
        vat_included_prices: false,
        finalize: 1,
        customer_tax_registration_number: faturaData.cliente?.nif || '',
        customer_business_name: faturaData.cliente?.nome || 'Consumidor Final',
        customer_address_detail: faturaData.cliente?.morada || 'Morada padrão',
        customer_postcode: faturaData.cliente?.codigo_postal || '1000-000',
        customer_city: faturaData.cliente?.cidade || 'Lisboa',
        customer_country: faturaData.cliente?.pais || 'PT',
        settlement_expression: faturaData.settlement_expression || '0',
        payment_mechanism: faturaData.payment_mechanism || 'MO',
        operation_country: faturaData.operation_country || 'PT',
        currency_conversion_rate: faturaData.currency_conversion_rate || 1,
        retention: faturaData.retention || 0,
        retention_type: faturaData.retention_type || '',
        apply_retention_when_paid: faturaData.apply_retention_when_paid || false,
        external_reference: faturaData.external_reference || '',
        lines: (faturaData.linhas || []).map(linha => ({
          item_type: linha.tipo === 'produto' ? 'Product' : 'Service',
          item_code: linha.codigo,
          description: linha.descricao,
          quantity: linha.quantidade,
          unit_price: linha.precoUnitario,
          vat_rate: linha.iva
        }))
      }
    }
  };
  console.log('JSON enviado para TOConline:', JSON.stringify(body, null, 2));
  const res = await fetch(`${BASE_URL}/api/commercial_sales_documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  if (!json.data || !json.data.id) {
    throw new Error('Não foi possível obter o ID da fatura simplificada. ' + JSON.stringify(json));
  }
  return json.data.id;
}
import fetch from 'node-fetch';
import { Buffer } from 'buffer';

const BASE_URL = 'https://api7.toconline.pt';
const OAUTH_URL = 'https://app7.toconline.pt/oauth';
const CLIENT_ID = 'pt999999990_c101423-6604ef0f5744561b';
const CLIENT_SECRET = '8f753cea78d995b5b6c877933495bf2b';
const REDIRECT_URI = 'https://oauth.pstmn.io/v1/callback';
const SCOPE = 'commercial';

// Função para obter o URL de autenticação OAuth2
export function getOAuthUrl() {
  return `${OAUTH_URL}/auth?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code&scope=${SCOPE}`;
}

// Função para trocar authorization_code por access_token
export async function getOAuthToken(code) {
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
      scope: SCOPE
    })
  });
  const json = await res.json();
  if (!json.access_token) {
    throw new Error('Falha ao obter access_token: ' + JSON.stringify(json));
  }
  return json.access_token;
}

// Função para criar fatura
export async function criarFatura(token, customerId, dataFatura = {}) {
  const res = await fetch(`${BASE_URL}/api/commercial_sales_documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      data: {
        type: 'commercial_sales_documents',
        attributes: {
          document_type: 'FT',
          date: dataFatura.date || new Date().toISOString().slice(0, 10),
          customer_id: customerId,
          due_date: dataFatura.due_date || new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 10),
          notes: dataFatura.notes || 'Fatura gerada via API',
          currency_iso_code: 'EUR',
          vat_included_prices: false
        }
      }
    })
  });
  const json = await res.json();
  if (!json.data || !json.data.id) {
    throw new Error('Não foi possível obter o ID da fatura.');
  }
  return json.data.id;
}

// Função para listar faturas
export async function listarFaturas(token) {
  const res = await fetch(`${BASE_URL}/api/commercial_sales_documents`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await res.json();
  if (!json.data) {
    throw new Error('Erro ao listar faturas: ' + JSON.stringify(json));
  }
  return json.data.map(fatura => ({
    id: fatura.id,
    tipo: fatura.attributes.document_type,
    cliente: fatura.attributes.customer_business_name,
    data: fatura.attributes.date
  }));
}

// Função para obter link do PDF pelo número/id da fatura
export async function getPdfLink(token, faturaId) {
  const res = await fetch(`${BASE_URL}/api/url_for_print/${faturaId}?filter[type]=Document`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await res.json();
  if (!json.data || !json.data.attributes || !json.data.attributes.url) {
    throw new Error('Não foi possível obter o link do PDF.');
  }
  const pdfUrl = json.data.attributes.url;
  let identificador = '';
  if (typeof pdfUrl === 'string') {
    const matchPublic = pdfUrl.match(/\/public-file\/([\w.-]+)/);
    const matchDownloads = pdfUrl.match(/\/downloads\/([\w.-]+)/);
    if (matchPublic && matchPublic[1]) {
      identificador = matchPublic[1];
    } else if (matchDownloads && matchDownloads[1]) {
      identificador = matchDownloads[1];
    } else {
      const parts = pdfUrl.split('/');
      identificador = parts[parts.length - 1];
    }
    if (!identificador) {
      throw new Error('Não foi possível extrair o identificador do link.');
    }
    return `https://app7.toconline.pt/downloads/${identificador}`;
  } else if (typeof pdfUrl === 'object' && pdfUrl.path) {
    // Se vier como objeto, extrai o path
    const path = pdfUrl.path;
    const parts = path.split('/');
    identificador = parts[parts.length - 1];
    if (!identificador) {
      throw new Error('Não foi possível extrair o identificador do link (objeto).');
    }
    return `https://app7.toconline.pt/downloads/${identificador}`;
  } else {
    throw new Error('Formato inesperado do campo url.');
  }
}
