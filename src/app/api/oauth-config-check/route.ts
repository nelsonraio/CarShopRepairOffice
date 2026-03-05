import { NextResponse } from 'next/server';

export async function GET() {
  const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || 'pt999999990_c101423-6604ef0f5744561b';
  const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || '8f753cea78d995b5b6c877933495bf2b';
  const OAUTH_URL = process.env.NEXT_PUBLIC_OAUTH_URL || 'https://app7.toconline.pt/oauth';
  const REDIRECT_URI = 'https://oauth.pstmn.io/v1/callback';

  return NextResponse.json({
    config: {
      CLIENT_ID,
      CLIENT_SECRET_LENGTH: CLIENT_SECRET?.length || 0,
      CLIENT_SECRET_FIRST_4: CLIENT_SECRET?.substring(0, 4) || '',
      OAUTH_URL,
      REDIRECT_URI,
      HAS_CLIENT_ID: !!CLIENT_ID,
      HAS_CLIENT_SECRET: !!CLIENT_SECRET && CLIENT_SECRET.length > 10,
    },
    basicAuth: Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64').substring(0, 30) + '...',
    warning: 'Esta rota deve ser bloqueada em produção!'
  });
}
