"use client";
import React, { useState } from 'react';

export default function FaturaSimplificadaForm() {
  const [jsonInput, setJsonInput] = useState(`{
  "document_type": "FT",
  "customer_business_name": "Consumidor Final",
  "lines": [
    {
      "description": "Artigo ou Serviço de Exemplo",
      "unit_price": "10.00",
      "quantity": "1",
      "tax_code": "NOR"
    }
  ]
}`);
  const [authCode, setAuthCode] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    let payload;
    try {
      payload = JSON.parse(jsonInput);
    } catch (err) {
      setResult('JSON inválido: ' + err.message);
      setLoading(false);
      return;
    }
    try {
      // Chamada à API local/backend que faz o envio para TOConline
      const res = await fetch('/api/fatura-simplificada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, authCode })
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult('Erro ao enviar: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>Enviar Fatura Simplificada (JSON)</h2>
      <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>
        Código de autorização OAuth2:
        <input
          type='text'
          value={authCode}
          onChange={e => setAuthCode(e.target.value)}
          style={{ width: '100%', marginBottom: 16 }}
          placeholder='Cole aqui o código de autorização...'
        />
      </label>
      <textarea
        value={jsonInput}
        onChange={e => setJsonInput(e.target.value)}
        rows={16}
        style={{ width: '100%', fontFamily: 'monospace', fontSize: 14 }}
        placeholder='Cole aqui o JSON completo...'
      />
      <button type='submit' disabled={loading} style={{ marginTop: 12 }}>
        {loading ? 'A enviar...' : 'Enviar'}
      </button>
      {result && (
        <pre style={{ marginTop: 16, background: '#f6f6f6', padding: 12 }}>{result}</pre>
      )}
    </form>
  );
}
