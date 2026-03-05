
import fetch from 'node-fetch';
import readline from 'readline';
import { Buffer } from 'buffer';

const BASE_URL = 'https://api7.toconline.pt';
const OAUTH_URL = 'https://app7.toconline.pt/oauth';
const CLIENT_ID = 'pt999999990_c101423-6604ef0f5744561b';
const CLIENT_SECRET = '8f753cea78d995b5b6c877933495bf2b';
const REDIRECT_URI = 'https://oauth.pstmn.io/v1/callback';
const SCOPE = 'commercial';

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

async function obterPdfFatura(token, faturaId) {
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
  const pdfUrl = json.data.attributes.url;
  // Extrair identificador do url devolvido
  let identificador = '';
  if (typeof pdfUrl === 'string') {
    // Aceita também path /downloads/{identificador}
    const matchPublic = pdfUrl.match(/\/public-file\/([\w.-]+)/);
    const matchDownloads = pdfUrl.match(/\/downloads\/([\w.-]+)/);
    if (matchPublic && matchPublic[1]) {
      identificador = matchPublic[1];
    } else if (matchDownloads && matchDownloads[1]) {
      identificador = matchDownloads[1];
    } else {
      // Se não encontrar, tenta usar tudo após o último /
      const parts = pdfUrl.split('/');
      identificador = parts[parts.length - 1];
    }
  }
  if (!identificador) {
    console.error('Valor devolvido pelo campo url:', pdfUrl);
    throw new Error('Não foi possível extrair o identificador do link.');
  }
  return `https://app7.toconline.pt/downloads/${identificador}`;
}

(async () => {
  try {
    const authorizationCode = await obterAuthorizationCode();
    const token = await obterTokenOAuth2(authorizationCode);
    const faturas = await listarFaturas(token);
    if (faturas.length === 0) {
      console.log('Nenhuma fatura encontrada.');
      return;
    }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Insira o ID da fatura para obter o PDF: ', async (faturaId) => {
      rl.close();
      try {
        const pdfUrl = await obterPdfFatura(token, faturaId.trim());
        console.log('Link completo para download do PDF:', pdfUrl);
      } catch (err) {
        console.error('Erro ao obter PDF:', err.message);
      }
    });
  } catch (err) {
    console.error('Erro:', err.message);
  }
})();
