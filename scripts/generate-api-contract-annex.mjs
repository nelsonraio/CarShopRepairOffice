import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const apiRoot = path.join(root, 'src', 'app', 'api');
const outFile = path.join(root, 'ANEXO_CONTRATO_API.txt');

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

function methodBlocks(text) {
  const re = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/g;
  const matches = [...text.matchAll(re)].map((m) => ({ method: m[1], index: m.index ?? 0 }));
  const blocks = [];

  for (let i = 0; i < matches.length; i += 1) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    blocks.push({ method: matches[i].method, code: text.slice(start, end) });
  }

  return blocks;
}

function extractParams(endpoint) {
  return [...endpoint.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
}

function extractQueryKeys(code) {
  const keys = [];
  const re = /searchParams\.get\(\s*['\"]([^'\"]+)['\"]\s*\)/g;
  let m;
  while ((m = re.exec(code))) keys.push(m[1]);
  return uniq(keys);
}

function extractBodyKeys(code) {
  const keys = [];
  const re = /body\.([A-Za-z_][A-Za-z0-9_]*)/g;
  let m;
  while ((m = re.exec(code))) keys.push(m[1]);
  return uniq(keys);
}

function extractResponseKeys(code) {
  const keys = [];
  const re = /NextResponse\.json\(\s*\{([\s\S]*?)\}\s*(?:,|\))/g;
  let m;
  while ((m = re.exec(code))) {
    const objLiteral = m[1];
    const keyRe = /([A-Za-z_][A-Za-z0-9_]*)\s*:/g;
    let mk;
    while ((mk = keyRe.exec(objLiteral))) keys.push(mk[1]);
  }
  return uniq(keys);
}

function extractStatusCodes(code) {
  const status = [];
  const statusRe = /status\s*:\s*(\d{3})/g;
  let m;
  while ((m = statusRe.exec(code))) status.push(m[1]);

  if (!status.includes('200')) {
    if (/NextResponse\.json\(/.test(code) && !/status\s*:/.test(code)) {
      status.push('200');
    }
  }

  return uniq(status).map((s) => Number(s)).sort((a, b) => a - b);
}

function inferType(code, field) {
  const f = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (new RegExp(`Array\\.isArray\\(\\s*body\\.${f}`).test(code)) return 'array';
  if (new RegExp(`(parseInt|parseFloat|Number|toSafePercent)\\(\\s*body\\.${f}`).test(code)) return 'number';
  if (new RegExp(`body\\.${f}\\s*!==\\s*undefined\\s*\\?\\s*(true|false)`).test(code)) return 'boolean';
  if (new RegExp(`Boolean\\(\\s*body\\.${f}`).test(code)) return 'boolean';
  if (new RegExp(`new Date\\(\\s*body\\.${f}`).test(code)) return 'string(date-time)';
  if (new RegExp(`body\\.${f}\\.(trim|toLowerCase|toUpperCase)\\(`).test(code)) return 'string';
  if (new RegExp(`String\\(\\s*body\\.${f}`).test(code)) return 'string';

  return 'unknown';
}

function inferRequired(code, field) {
  const f = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (new RegExp(`if\\s*\\(\\s*!body\\.${f}\\s*\\)`).test(code)) return 'yes';
  if (new RegExp(`if\\s*\\(\\s*body\\.${f}\\s*===\\s*undefined\\s*\\)`).test(code)) return 'yes';
  if (new RegExp(`:\\s*body\\.${f}(\\s*[,}])`).test(code)) return 'yes';
  if (new RegExp(`body\\.${f}\\s*\\|\\|`).test(code)) return 'no';
  if (new RegExp(`body\\.${f}\\s*\\?\\?`).test(code)) return 'no';
  if (new RegExp(`body\\.${f}\\s*!==\\s*undefined\\s*\\?`).test(code)) return 'no';

  return 'unknown';
}

function exampleValue(type, field) {
  if (type === 'number') return 0;
  if (type === 'boolean') return true;
  if (type === 'array') return [];
  if (type === 'string(date-time)') return '2026-03-06T00:00:00.000Z';
  if (type === 'string') return `<${field}>`;
  return null;
}

function buildMethodDoc(endpoint, method, code) {
  const query = extractQueryKeys(code);
  const bodyFields = extractBodyKeys(code);
  const responseKeys = extractResponseKeys(code);
  const statusCodes = extractStatusCodes(code);

  const bodySchema = bodyFields.map((field) => {
    const type = inferType(code, field);
    const required = inferRequired(code, field);
    return { field, type, required };
  });

  const example = {};
  for (const f of bodySchema) {
    example[f.field] = exampleValue(f.type, f.field);
  }

  return {
    endpoint,
    method,
    query,
    bodySchema,
    responseKeys,
    statusCodes,
    example,
    usesBody: bodyFields.length > 0,
    hasHelperResponse: /successResponse\(/.test(code) || /errorResponse\(/.test(code),
  };
}

function parseFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const endpoint = rel
    .replace(/^src\/app/, '')
    .replace(/\/route\.(ts|js|tsx|jsx)$/,'')
    .replace(/\[(.*?)\]/g, '{$1}');

  const params = uniq(extractParams(endpoint));
  const blocks = methodBlocks(text);
  const methods = blocks.map((b) => buildMethodDoc(endpoint, b.method, b.code));

  return { endpoint, rel, params, methods };
}

const files = walk(apiRoot).sort((a, b) => a.localeCompare(b));
const docs = files.map(parseFile);

let out = '';
out += 'ANEXO - Contrato de API (Schema Inferido)\n';
out += `Gerado em: ${new Date().toISOString()}\n`;
out += 'Fonte: src/app/api/**/route.*\n';
out += 'Aviso: schema inferido estaticamente (pode exigir ajuste manual em casos complexos).\n\n';
out += 'Legenda:\n';
out += '- required: yes | no | unknown\n';
out += '- type: inferido por uso no codigo\n';
out += '- response_keys: chaves observadas em NextResponse.json({...})\n';
out += '- status_codes: codigos observados no endpoint\n\n';

for (const d of docs) {
  out += '============================================================\n';
  out += `${d.endpoint}\n`;
  out += `arquivo: ${d.rel}\n`;
  out += `path_params: ${d.params.length ? d.params.join(', ') : '-'}\n\n`;

  for (const m of d.methods) {
    out += `[${m.method}]\n`;
    out += `query_params: ${m.query.length ? m.query.join(', ') : '-'}\n`;

    if (m.usesBody) {
      out += 'request_body_schema:\n';
      for (const f of m.bodySchema) {
        out += `- ${f.field}: type=${f.type}, required=${f.required}\n`;
      }
      out += 'request_body_example:\n';
      out += `${JSON.stringify(m.example, null, 2)}\n`;
    } else {
      out += 'request_body_schema: -\n';
      out += 'request_body_example: {}\n';
    }

    out += `response_keys: ${m.responseKeys.length ? m.responseKeys.join(', ') : '-'}\n`;
    out += `status_codes: ${m.statusCodes.length ? m.statusCodes.join(', ') : '-'}\n`;
    if (m.hasHelperResponse) {
      out += 'nota: resposta tambem passa por helper (successResponse/errorResponse).\n';
    }
    out += '\n';
  }
}

fs.writeFileSync(outFile, out, 'utf8');
console.log(`Wrote ${path.relative(root, outFile)} with ${docs.length} endpoints`);
