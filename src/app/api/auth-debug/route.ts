import { NextRequest, NextResponse } from 'next/server';

// Endpoint de debug para testar troca de authorization_code por access_token
// Aceder em: GET /api/auth-debug  (mostra formulário)
//            POST /api/auth-debug { code, redirectUri? }

const CLIENT_ID     = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID   ?? '';
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET            ?? '';
const OAUTH_URL     = process.env.NEXT_PUBLIC_OAUTH_URL          ?? '';
const REDIRECT_URI  = process.env.NEXT_PUBLIC_REDIRECT_URI       ?? '';

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8"/>
  <title>TOConline Auth Debug</title>
  <style>
    body { font-family: monospace; background:#0f172a; color:#e2e8f0; padding:2rem; }
    h1   { color:#fbbf24; }
    label{ display:block; margin-top:1rem; color:#94a3b8; }
    input{ width:100%; padding:.5rem; background:#1e293b; border:1px solid #334155; color:#e2e8f0; border-radius:4px; margin-top:.25rem; }
    button{ margin-top:1.5rem; padding:.75rem 2rem; background:#fbbf24; color:#0f172a; font-weight:bold; border:none; border-radius:6px; cursor:pointer; }
    pre  { margin-top:2rem; background:#1e293b; padding:1rem; border-radius:6px; overflow:auto; white-space:pre-wrap; }
    .section { margin-top:1.5rem; border-top:1px solid #334155; padding-top:1rem; }
    .label-info { color:#64748b; font-size:.85rem; }
  </style>
</head>
<body>
  <h1>🔐 TOConline Auth Debug</h1>

  <div class="section">
    <div class="label-info">Configuração atual (.env)</div>
    <pre id="config">A carregar...</pre>
  </div>

  <div class="section">
    <div class="label-info">Passo 1 — Gera o URL de autenticação e abre no browser</div>
    <pre id="authUrl">A carregar...</pre>
    <button onclick="openAuth()">Abrir autenticação TOConline</button>
  </div>

  <div class="section">
    <div class="label-info">Passo 2 — Cola o <code>code</code> que recebeste no callback</div>
    <label>Authorization Code
      <input id="code" placeholder="cole o code=... aqui"/>
    </label>
    <label>Redirect URI (opcional, usa o do .env se vazio)
      <input id="redirectUri" placeholder="${REDIRECT_URI}"/>
    </label>
    <button onclick="trocarToken()">Trocar código por token</button>
  </div>

  <pre id="result" style="display:none"></pre>

  <script>
    fetch('/api/auth-debug/config').then(r=>r.json()).then(d=>{
      document.getElementById('config').textContent = JSON.stringify(d, null, 2);
      document.getElementById('authUrl').textContent = d.authUrl;
    });

    function openAuth() {
      fetch('/api/auth-debug/config').then(r=>r.json()).then(d=>{
        window.open(d.authUrl, '_blank');
      });
    }

    async function trocarToken() {
      const code = document.getElementById('code').value.trim();
      const redirectUri = document.getElementById('redirectUri').value.trim();
      if (!code) { alert('Cola o código primeiro!'); return; }
      const pre = document.getElementById('result');
      pre.style.display = 'block';
      pre.textContent = 'A processar...';
      const res = await fetch('/api/auth-debug', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ code, redirectUri: redirectUri || undefined })
      });
      const data = await res.json();
      pre.textContent = JSON.stringify(data, null, 2);
    }
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const code: string = body.code ?? '';
  const redirectUri: string = body.redirectUri ?? REDIRECT_URI;

  if (!code) {
    return NextResponse.json({ error: 'Parâmetro "code" obrigatório.' }, { status: 400 });
  }

  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const tokenUrl  = `${OAUTH_URL}/token`;

  const bodyParams = new URLSearchParams({
    grant_type:   'authorization_code',
    code:          code.trim(),
    redirect_uri:  redirectUri,
    scope:        'commercial',
  });

  const requestInfo = {
    url:    tokenUrl,
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Accept':        'application/json',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: Object.fromEntries(bodyParams),
  };

  console.log('[auth-debug] REQUEST →', JSON.stringify(requestInfo, null, 2));

  let httpStatus: number;
  let responseBody: unknown;
  let responseHeaders: Record<string, string>;

  try {
    const res = await fetch(tokenUrl, {
      method:  'POST',
      headers: requestInfo.headers,
      body:    bodyParams,
    });

    httpStatus      = res.status;
    responseHeaders = Object.fromEntries(res.headers.entries());
    responseBody    = await res.json();
  } catch (err) {
    return NextResponse.json({
      request: requestInfo,
      error:   err instanceof Error ? err.message : String(err),
    }, { status: 502 });
  }

  console.log('[auth-debug] RESPONSE ←', httpStatus, JSON.stringify(responseBody, null, 2));

  const success = typeof responseBody === 'object' && responseBody !== null && 'access_token' in responseBody;

  return NextResponse.json({
    request:  requestInfo,
    response: {
      status:  httpStatus,
      headers: responseHeaders,
      body:    responseBody,
    },
    success,
    token_preview: success
      ? String((responseBody as Record<string, unknown>).access_token ?? '').slice(0, 20) + '...'
      : null,
  });
}
