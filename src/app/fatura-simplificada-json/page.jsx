
import FaturaSimplificadaForm from '../../components/FaturaSimplificadaForm.jsx';
import ProdutosListagem from '../../components/ProdutosListagem.jsx';

const OAUTH_URL = 'https://app7.toconline.pt/oauth/auth';
const CLIENT_ID = 'pt999999990_c101423-6604ef0f5744561b';
const REDIRECT_URI = 'https://oauth.pstmn.io/v1/callback';
const SCOPE = 'commercial';
const authUrl = `${OAUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${SCOPE}`;

export default function Page() {
  return (
    <div style={{ padding: 32 }}>
      <h2>Gerar Código de Autorização OAuth2</h2>
      <a href={authUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', fontWeight: 'bold', display: 'inline-block', marginBottom: 24 }}>
        Clique aqui para autorizar e obter o código
      </a>
      <a
        href="/api/produtos"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#0070f3', fontWeight: 'bold', display: 'inline-block', marginBottom: 24 }}
      >
        Listar produtos (IDs internos e externos)
      </a>
      <FaturaSimplificadaForm />
      <ProdutosListagem />
    </div>
  );
}
