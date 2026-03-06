import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const apiRoot = path.join(root, 'src', 'app', 'api');
const outFile = path.join(root, 'ANEXO_SCHEMAS_API.txt');

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (/route\.(ts|js|tsx|jsx)$/.test(ent.name)) out.push(p);
  }
  return out;
}

const uniq = (arr) => [...new Set(arr)].sort();

function extractObjectKeys(objLiteral) {
  const keys = [];
  const re = /([A-Za-z_][A-Za-z0-9_]*)\s*:/g;
  let m;
  while ((m = re.exec(objLiteral))) keys.push(m[1]);
  return uniq(keys);
}

function parseFile(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const endpoint = rel
    .replace(/^src\/app/, '')
    .replace(/\/route\.(ts|js|tsx|jsx)$/,'')
    .replace(/\[(.*?)\]/g, '{$1}');

  const methods = [];
  const mRe = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/g;
  let mm;
  while ((mm = mRe.exec(txt))) methods.push(mm[1]);

  const query = [];
  const qRe = /searchParams\.get\(\s*['\"]([^'\"]+)['\"]\s*\)/g;
  let mq;
  while ((mq = qRe.exec(txt))) query.push(mq[1]);

  const bodyKeys = [];
  const bRe = /body\.([A-Za-z_][A-Za-z0-9_]*)/g;
  let mb;
  while ((mb = bRe.exec(txt))) bodyKeys.push(mb[1]);

  const params = [...endpoint.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);

  const responseKeys = [];
  const nrRe = /NextResponse\.json\(\s*\{([\s\S]*?)\}\s*(?:,|\))/g;
  let mr;
  while ((mr = nrRe.exec(txt))) {
    extractObjectKeys(mr[1]).forEach((k) => responseKeys.push(k));
  }

  return {
    rel,
    endpoint,
    methods: uniq(methods),
    params: uniq(params),
    query: uniq(query),
    body: uniq(bodyKeys),
    response: uniq(responseKeys),
  };
}

const files = walk(apiRoot).sort((a, b) => a.localeCompare(b));
const docs = files.map(parseFile);

let out = '';
out += 'ANEXO - Schemas de Payload por Endpoint\n';
out += `Gerado em: ${new Date().toISOString()}\n`;
out += 'Base: inferencia estatica a partir de src/app/api/**/route.*\n\n';
out += 'Legenda:\n';
out += '- Path params: parametros no caminho ({id}, etc.)\n';
out += '- Query params: parametros lidos via searchParams.get(...)\n';
out += '- Body fields: campos usados no request body (body.campo)\n';
out += '- Response keys: chaves de objetos retornados via NextResponse.json({...})\n\n';

for (const d of docs) {
  out += '------------------------------------------------------------\n';
  out += `${d.endpoint}\n`;
  out += `Arquivo: ${d.rel}\n`;
  out += `Metodos: ${d.methods.length ? d.methods.join(', ') : 'N/A'}\n`;
  out += `Path params: ${d.params.length ? d.params.join(', ') : '-'}\n`;
  out += `Query params: ${d.query.length ? d.query.join(', ') : '-'}\n`;
  out += `Body fields: ${d.body.length ? d.body.join(', ') : '-'}\n`;
  out += `Response keys: ${d.response.length ? d.response.join(', ') : '-'}\n\n`;
}

fs.writeFileSync(outFile, out, 'utf8');
console.log(`Wrote ${path.relative(root, outFile)} with ${docs.length} endpoints`);
