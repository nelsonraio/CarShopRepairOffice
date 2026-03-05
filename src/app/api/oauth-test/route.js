import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { clientId, clientSecret, redirectUri, testCode } = await req.json();
    
    console.log('🔍 Testando OAuth com:');
    console.log('   CLIENT_ID:', clientId);
    console.log('   REDIRECT_URI:', redirectUri);
    console.log('   Code:', testCode?.substring(0, 20) + '...');
    
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const payload = new URLSearchParams({
      grant_type: 'authorization_code',
      code: testCode,
      redirect_uri: redirectUri,
      scope: 'commercial'
    });
    
    console.log('📤 Enviando para:', 'https://app7.toconline.pt/oauth/token');
    console.log('📦 Body:', payload.toString());
    
    const res = await fetch('https://app7.toconline.pt/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
        'User-Agent': 'CarShopRepairOffice/1.0'
      },
      body: payload
    });
    
    const data = await res.json();
    
    console.log('📡 Resposta do TOConline:', {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      data
    });
    
    return NextResponse.json({
      success: res.ok,
      status: res.status,
      data,
      config: {
        clientId: clientId?.substring(0, 10) + '...',
        redirectUri,
        basicAuthLength: basicAuth.length
      }
    });
  } catch (err) {
    console.error('❌ Erro:', err);
    return NextResponse.json({ 
      error: err.message,
      stack: err.stack 
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const clientId = req.nextUrl.searchParams.get('clientId') || process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID;
    const clientSecret = req.nextUrl.searchParams.get('clientSecret') || process.env.OAUTH_CLIENT_SECRET;
    const redirectUri = req.nextUrl.searchParams.get('redirectUri') || process.env.NEXT_PUBLIC_REDIRECT_URI;
    
    if (!code) {
      return NextResponse.json({
        message: 'Faltam parâmetros. Use POST com { clientId, clientSecret, redirectUri, testCode }',
        example: '/api/oauth-test?code=YOUR_CODE&clientId=...&clientSecret=...&redirectUri=...',
        currentConfig: {
          clientId: clientId?.substring(0, 15) + '...',
          redirectUri: redirectUri,
          hasSecret: !!clientSecret
        }
      });
    }
    
    // Chamar a função de teste via POST simulado
    const testRequest = {
      json: async () => ({ clientId, clientSecret, redirectUri, testCode: code })
    };
    
    return POST(testRequest);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
