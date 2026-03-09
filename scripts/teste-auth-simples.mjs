import 'dotenv/config';
import open from 'open';

const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const REDIRECT_URI =
  getArg('redirect-uri') ||
  'https://pond-computer-hear-initiatives.trycloudflare.com/callbackr';
const OAUTH_BASE = process.env.NEXT_PUBLIC_OAUTH_URL || 'https://api.toconline.pt/oauth';
const SCOPE = process.env.OAUTH_SCOPE || 'commercial';

function usage() {
  console.log('Uso:');
  console.log('  node scripts/teste-auth-simples.mjs');
  console.log('  node scripts/teste-auth-simples.mjs --code=SEU_CODE');
  console.log('  node scripts/teste-auth-simples.mjs --redirect-uri=https://exemplo.com/callbackr');
  console.log('');
  console.log('Sem --code: gera URL de autorizacao e tenta abrir no browser.');
  console.log('Com --code: troca o code por access_token e mostra a resposta.');
}

function getArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((v) => v.startsWith(prefix));
  return arg ? arg.slice(prefix.length).trim() : '';
}

function buildAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID || '',
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE
  });

  return `${OAUTH_BASE}/auth?${params.toString()}`;
}

async function exchangeCodeForToken(code) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Defina NEXT_PUBLIC_OAUTH_CLIENT_ID e OAUTH_CLIENT_SECRET no .env');
  }

  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE
  });

  const res = await fetch(`${OAUTH_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Authorization: `Basic ${basicAuth}`
    },
    body
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Falha no token (${res.status}): ${JSON.stringify(data)}`);
  }

  return data;
}

async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    usage();
    return;
  }

  const code = getArg('code');

  if (!code) {
    const authUrl = buildAuthUrl();
    console.log('URL de autenticacao:');
    console.log(authUrl);
    console.log('');
    console.log('Depois de autorizar, copie o parametro code e execute:');
    console.log('node scripts/teste-auth-simples.mjs --code=SEU_CODE');

    try {
      await open(authUrl);
      console.log('Browser aberto automaticamente.');
    } catch {
      console.log('Nao foi possivel abrir o browser automaticamente.');
    }

    return;
  }

  const token = await exchangeCodeForToken(code);

  console.log('Autenticacao OK.');
  console.log(JSON.stringify({
    token_type: token.token_type,
    scope: token.scope,
    expires_in: token.expires_in,
    access_token_preview: token.access_token ? `${token.access_token.slice(0, 24)}...` : null,
    has_refresh_token: !!token.refresh_token
  }, null, 2));
}

main().catch((err) => {
  console.error('Erro:', err.message);
  process.exit(1);
});
