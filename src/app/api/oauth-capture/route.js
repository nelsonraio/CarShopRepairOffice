import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const clientId = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || 'pt999999990_c101423-6604ef0f5744561b';
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || 'https://pond-computer-hear-initiatives.trycloudflare.com/callback';
    
    console.log('🔐 Capturando authorization code...');
    console.log('   CLIENT_ID:', clientId);
    console.log('   REDIRECT_URI:', redirectUri);
    
    const url = 'https://api.toconline.pt/oauth/auth?' + new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'commercial'
    });

    console.log('📤 GET:', url);

    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual'
    });

    console.log('📡 Resposta:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers)
    });

    // Capturar o header 'location' que contém o redirecionamento com o código
    const location = response.headers.get('location');

    if (location) {
      console.log('📍 Location header:', location);
      
      const urlParams = new URL(location);
      const code = urlParams.searchParams.get('code');
      const error = urlParams.searchParams.get('error');
      
      if (code) {
        console.log('✅ Código capturado:', code.substring(0, 30) + '...');
        return NextResponse.json({ 
          success: true, 
          code,
          timestamp: new Date().toISOString()
        });
      } else if (error) {
        console.error('❌ Erro OAuth:', error);
        return NextResponse.json({ 
          success: false, 
          error: urlParams.searchParams.get('error_description') || error
        }, { status: 400 });
      }
    } else {
      console.log('❌ Nenhum header location encontrado');
      return NextResponse.json({ 
        success: false, 
        error: 'Redirecionamento não encontrado. Verifique as credenciais.',
        details: {
          status: response.status,
          statusText: response.statusText
        }
      }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
