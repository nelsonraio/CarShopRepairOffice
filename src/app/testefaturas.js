import fetch from 'node-fetch';
import http from 'http';
import open from 'open';
import { Buffer } from 'buffer';

const BASE_URL = 'https://api7.toconline.pt';
const OAUTH_URL = 'https://app7.toconline.pt/oauth';
const CLIENT_ID = 'pt999999990_c101423-6604ef0f5744561b';
const CLIENT_SECRET = '8f753cea78d995b5b6c877933495bf2b';
const REDIRECT_URI = 'http://127.0.0.1:4080/oauth/callback';
const SCOPE = 'commercial';
const PORT = 4080;

// Passo 1: Obter authorization_code automaticamente
async function obterAuthorizationCode() {
  const url = `${OAUTH_URL}/auth?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code&scope=${SCOPE}`;
  console.log('A abrir o browser para autenticação...');
  await open(url);
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.url.startsWith('/oauth/callback')) {
        const urlObj = new URL(req.url, `http://127.0.0.1:${PORT}`);
        const code = urlObj.searchParams.get('code');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h2>Autenticação concluída. Pode fechar esta janela.</h2>');
        server.close();
        if (code) {
          resolve(code);
        } else {
          reject(new Error('Authorization code não encontrado.'));
        }
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    server.listen(PORT, () => {
      console.log(`A aguardar autenticação em ${REDIRECT_URI} ...`);
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

async function criarFatura(token) {
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
          customer_id: 2, // Altere para um ID válido
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

async function adicionarLinhaFatura(faturaId, token) {
  await fetch(`${BASE_URL}/api/commercial_sales_document_lines`, {
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
          item_id: 2,
          unit_of_measure_id: 2,
          tax_id: 2
        }
      }
    })
  });
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

(async () => {
  try {
    const authorizationCode = await obterAuthorizationCode();
    const token = await obterTokenOAuth2(authorizationCode);
    const faturaId = await criarFatura(token);
    console.log('Fatura criada com ID:', faturaId);
    await adicionarLinhaFatura(faturaId, token);
    const pdfUrl = await obterPdfFatura(faturaId, token);
    console.log('Link para o PDF da fatura:', pdfUrl);
  } catch (err) {
    console.error('Erro:', err.message);
  }
})();
