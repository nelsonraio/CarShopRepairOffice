import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const config = {
      CLIENT_ID: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
      REDIRECT_URI: process.env.NEXT_PUBLIC_REDIRECT_URI,
      OAUTH_URL: process.env.NEXT_PUBLIC_OAUTH_URL,
      BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      HAS_SECRET: !!process.env.OAUTH_CLIENT_SECRET,
      NODE_ENV: process.env.NODE_ENV
    };
    
    // Teste: tenta obter token com um código teste
    const testCode = req.nextUrl.searchParams.get('code');
    
    if (testCode) {
      const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID;
      const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
      const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
      
      const res = await fetch('https://app7.toconline.pt/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: testCode,
          redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI,
          scope: 'commercial'
        }).toString()
      });
      
      const data = await res.json();
      return NextResponse.json({
        config,
        tokenResponse: {
          status: res.status,
          ok: res.ok,
          data
        }
      });
    }
    
    return NextResponse.json({ config });
  } catch (err) {
    return NextResponse.json({ 
      error: err.message,
      stack: err.stack 
    }, { status: 500 });
  }
}
