import fetch from 'node-fetch';
import readline from 'readline';
import { Buffer } from 'buffer';

const BASE_URL = 'https://api7.toconline.pt';
const OAUTH_URL = 'https://app7.toconline.pt/oauth';
const CLIENT_ID = 'pt999999990_c101423-6604ef0f5744561b';
const CLIENT_SECRET = '8f753cea78d995b5b6c877933495bf2b';
const REDIRECT_URI = 'https://oauth.pstmn.io/v1/callback'; // Use o URI permitido
const SCOPE = 'commercial';

// Passo 1: Obter authorization_code manualmente
async function obterAuthorizationCode() {
  const url = `${OAUTH_URL}/auth?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code&scope=${SCOPE}`;
  console.log('Abra este URL no browser e autorize a aplicação:');
  console.log(url);
  console.log('Depois de autorizar, copie o parâmetro "code" da URL de callback.');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question('Cole aqui o authorization_code: ', code => {
      rl.close();
      resolve(code.trim());
    });
  });
}

// Passo 2: Trocar authorization_code por access_token
async function obterTokenOAuth2(code) {
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

// Listar clientes
async function listarClientes(token) {
  const res = await fetch(`${BASE_URL}/api/customers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await res.json();
  if (!json.data) {
    console.error('Erro ao listar clientes:', json);
    return [];
  }
  console.log('Clientes disponíveis:');
  json.data.forEach(cliente => {
    console.log(`ID: ${cliente.id} | Nome: ${cliente.attributes.business_name} | NIF: ${cliente.attributes.tax_registration_number}`);
  });
  return json.data;
}

async function criarFatura(token, customerId) {
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
          date: '2026-03-02',
          customer_id: customerId,
          due_date: '2026-03-10',
          notes: 'Teste de fatura gerada via script',
          currency_iso_code: 'EUR',
          vat_included_prices: false
        }
      }
    })
  });
  const json = await res.json();
  if (!json.data || !json.data.id) {
    console.error('Resposta inesperada ao criar fatura:', json);
    throw new Error('Não foi possível obter o ID da fatura.');
  }
  return json.data.id;
}

async function adicionarLinhaFatura(token, faturaId) {
  const res = await fetch(`${BASE_URL}/api/commercial_sales_document_lines`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      data: {
        type: 'commercial_sales_document_lines',
        attributes: {
          document_id: faturaId,
          item_type: 'Product',
          quantity: 1,
          unit_price: 9.99,
          item_id: 21, // Produto existente
          description: 'Produto de teste',
          unit_of_measure_id: 2,
          tax_id: 2
        }
      }
    })
  });
  if (!res.ok) {
    console.error('Erro ao adicionar linha à fatura:', await res.text());
    throw new Error('Não foi possível adicionar linha à fatura.');
  }
  console.log('Linha adicionada à fatura com sucesso.');
}

async function obterPdfFatura(faturaId, token) {
  const res = await fetch(`${BASE_URL}/api/url_for_print/${faturaId}?filter[type]=Document`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await res.json();
  if (!json.data || !json.data.attributes || !json.data.attributes.url) {
    console.error('Resposta inesperada ao obter PDF:', json);
    throw new Error('Não foi possível obter o link do PDF.');
  }
  return json.data.attributes.url;
}

// Listar todas as faturas
async function finalizarFatura(faturaId, token) {
  const res = await fetch(`${BASE_URL}/api/commercial_sales_documents`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      data: {
        type: 'commercial_sales_documents',
        id: faturaId,
        attributes: {
          status: 1
        }
      }
    })
  });
  if (!res.ok) {
    console.error('Erro ao finalizar fatura:', await res.text());
    throw new Error('Não foi possível finalizar a fatura.');
  }
  console.log('Fatura finalizada com sucesso.');
}

async function listarFaturas(token) {
  const res = await fetch(`${BASE_URL}/api/commercial_sales_documents`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await res.json();
  if (!json.data) {
    console.error('Erro ao listar faturas:', json);
    return [];
  }
  console.log('\nFaturas existentes:');
  json.data.forEach(fatura => {
    console.log(`ID: ${fatura.id} | Tipo: ${fatura.attributes.document_type} | Cliente: ${fatura.attributes.customer_business_name} | Data: ${fatura.attributes.date}`);
  });
  return json.data;
}

(async () => {
  try {
    const authorizationCode = await obterAuthorizationCode();
    const token = await obterTokenOAuth2(authorizationCode);
    const clientes = await listarClientes(token);
    if (clientes.length === 0) throw new Error('Nenhum cliente disponível.');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Insira o ID do cliente para criar a fatura: ', async (customerId) => {
      rl.close();
      const faturaId = await criarFatura(token, customerId.trim());
      console.log('Fatura criada com ID:', faturaId);
      await adicionarLinhaFatura(token, faturaId);
      await finalizarFatura(faturaId, token);
      const pdfUrl = await obterPdfFatura(faturaId, token);
      console.log('Link para o PDF da fatura:', pdfUrl);
      await listarFaturas(token);
    });
  } catch (err) {
    console.error('Erro:', err.message);
  }
})();