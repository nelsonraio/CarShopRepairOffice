"use client";
import React, { useState } from "react";

export default function ProdutosListagem() {
  const [token, setToken] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [rawResponse, setRawResponse] = useState("");
  const handleListar = async () => {
    setLoading(true);
    setError("");
    setProdutos([]);
    setRawResponse("");
    try {
      const res = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = undefined;
      }
      if (res.ok && Array.isArray(data)) {
        setProdutos(data);
      } else {
        setRawResponse(text);
      }
    } catch (err) {
      setError("Erro ao obter produtos: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: 32, marginBottom: 32 }}>
      <h3>Listar produtos (IDs internos e externos)</h3>
      <input
        type="text"
        value={token}
        onChange={e => setToken(e.target.value)}
        placeholder="Cole aqui o token OAuth2..."
        style={{ width: "100%", marginBottom: 8 }}
      />
      <button onClick={handleListar} disabled={loading || !token} style={{ marginBottom: 12 }}>
        {loading ? "Carregando..." : "Listar Produtos"}
      </button>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {rawResponse && (
        <pre style={{ background: '#f6f6f6', padding: 12, marginBottom: 8 }}>{rawResponse}</pre>
      )}
      {produtos.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>ID Interno</th>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>Código Externo</th>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(prod => (
              <tr key={prod.id_interno}>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>{prod.id_interno}</td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>{prod.codigo_externo}</td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>{prod.descricao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
