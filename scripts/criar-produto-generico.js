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

async function criarProduto(token) {
  const res = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      data: {
        type: 'products',
        attributes: {
          type: 'Product',
          item_code: '1',
          item_description: 'Peça Generica',
          sales_price: 10,
          sales_price_includes_vat: false,
          tax_code: 'NOR'
        }
      }
    })
  });
  const json = await res.json();
  if (!res.ok) {
    console.error('Erro ao criar produto:', json);
    return;
  }
  console.log('Produto criado:', json);
}

(async () => {
  try {
    const authorizationCode = await obterAuthorizationCode();
    const token = await obterTokenOAuth2(authorizationCode);
    await criarProduto(token);
  } catch (err) {
    console.error('Erro:', err.message);
  }
})();
