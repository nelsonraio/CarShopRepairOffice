import fetch from 'node-fetch';
import { Buffer } from 'buffer';

const BASE_URL = 'https://api7.toconline.pt';
const OAUTH_URL = 'https://app7.toconline.pt/oauth';
const CLIENT_ID = 'pt999999990_c101423-6604ef0f5744561b';
const CLIENT_SECRET = '8f753cea78d995b5b6c877933495bf2b';
const REDIRECT_URI = 'https://oauth.pstmn.io/v1/callback';
const SCOPE = 'commercial';

export async function debugPdfUrl(token, faturaId) {
  const res = await fetch(`${BASE_URL}/api/url_for_print/${faturaId}?filter[type]=Document`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await res.json();
  if (!json.data || !json.data.attributes || !json.data.attributes.url) {
    throw new Error('Não foi possível obter o link do PDF.');
  }
  const pdfUrl = json.data.attributes.url;
  console.log('DEBUG: Valor devolvido pelo campo url:', pdfUrl);
  return pdfUrl;
}
