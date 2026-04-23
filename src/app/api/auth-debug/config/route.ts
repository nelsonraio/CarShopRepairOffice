import { NextResponse } from 'next/server';

const CLIENT_ID    = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID ?? '';
const OAUTH_URL    = process.env.NEXT_PUBLIC_OAUTH_URL       ?? '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI    ?? '';

export async function GET() {
  const authUrl = OAUTH_URL
    ? `${OAUTH_URL}/auth?` + new URLSearchParams({
        client_id:     CLIENT_ID,
        redirect_uri:  REDIRECT_URI,
        response_type: 'code',
        scope:         'commercial',
      }).toString()
    : 'NEXT_PUBLIC_OAUTH_URL não configurado';

  return NextResponse.json({
    CLIENT_ID:    CLIENT_ID    || '❌ não configurado',
    OAUTH_URL:    OAUTH_URL    || '❌ não configurado',
    REDIRECT_URI: REDIRECT_URI || '❌ não configurado',
    CLIENT_SECRET_SET: !!process.env.OAUTH_CLIENT_SECRET,
    authUrl,
  });
}
