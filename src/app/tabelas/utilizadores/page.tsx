"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface Utilizador {
  id: number;
  nome_utilizador: string;
  email: string;
  nome_completo: string;
  papel: "admin" | "gestor" | "mecanico" | "rececionista";
  ativo: boolean;
  ultimo_login: string | null;
  criado_em: string;
}

const papelBadgeClass = (papel: string) => {
  switch (papel) {
    case "admin":
      return "bg-red-900 text-red-200 border border-red-700";
    case "gestor":
      return "bg-purple-900 text-purple-200 border border-purple-700";
    case "mecanico":
      return "bg-blue-900 text-blue-200 border border-blue-700";
    case "rececionista":
      return "bg-green-900 text-green-200 border border-green-700";
    default:
      return "bg-gray-700 text-gray-200 border border-gray-600";
  }
};

const papelNome = (papel: string) => {
  switch (papel) {
    case "admin":
      return "Administrador";
    case "gestor":
      return "Gestor";
    case "mecanico":
      return "Mecânico";
    case "rececionista":
      return "Recepcionista";
    default:
      return papel;
  }
};

export default function UtilizadoresPage() {
  const router = useRouter();
  const [utilizadores, setUtilizadores] = useState<Utilizador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUtilizador, setSelectedUtilizador] = useState<Utilizador | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    nome_utilizador: "",
    email: "",
    nome_completo: "",
    papel: "mecanico" as "admin" | "gestor" | "mecanico" | "rececionista",
    hash_palavra_passe: "",
  });

  useEffect(() => {
    fetchUtilizadores();
  }, []);

  const fetchUtilizadores = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/utilizadores", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setUtilizadores(data);
      }
    } catch (error) {
      console.error("Erro ao carregar utilizadores:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUtilizadores = utilizadores.filter(
    (u) =>
      u.nome_utilizador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (utilizador: Utilizador) => {
    setSelectedUtilizador(utilizador);
    setIsCreating(false);
    setFormData({
      nome_utilizador: utilizador.nome_utilizador,
      email: utilizador.email,
      nome_completo: utilizador.nome_completo,
      papel: utilizador.papel as "admin" | "gestor" | "mecanico" | "rececionista",
      hash_palavra_passe: "",
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedUtilizador(null);
    setIsCreating(true);
    setFormData({
      nome_utilizador: "",
      email: "",
      nome_completo: "",
      papel: "mecanico" as "admin" | "gestor" | "mecanico" | "rececionista",
      hash_palavra_passe: "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nome_utilizador || !formData.email || !formData.nome_completo) {
      alert("Preenchê todos os campos obrigatórios");
      return;
    }

    if (isCreating && !formData.hash_palavra_passe) {
      alert("Defina uma palavra-passe para o novo utilizador");
      return;
    }

    try {
      const url = isCreating ? "/api/utilizadores" : `/api/utilizadores/${selectedUtilizador?.id}`;
      const method = isCreating ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        await fetchUtilizadores();
        router.refresh();
        alert(isCreating ? "Utilizador criado com sucesso!" : "Utilizador atualizado com sucesso!");
      } else {
        alert("Erro ao guardar utilizador");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao guardar utilizador");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem a certeza que deseja eliminar este utilizador?")) return;

    try {
      const response = await fetch(`/api/utilizadores/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchUtilizadores();
        alert("Utilizador eliminado com sucesso!");
      } else {
        alert("Erro ao eliminar utilizador");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao eliminar utilizador");
    }
  };

  const handleToggleActive = async (utilizador: Utilizador) => {
    try {
      const response = await fetch(`/api/utilizadores/${utilizador.id}/toggle-ativo`, {
        method: "PATCH",
      });

      if (response.ok) {
        fetchUtilizadores();
      } else {
        alert("Erro ao atualizar estado");
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="tabelas" />

      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-100">Utilizadores</h2>
            <p className="mt-1 text-gray-400">Gestão de utilizadores e papéis do sistema</p>
          </div>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-yellow-400 transition-colors rounded-none"
          >
            + Novo Utilizador
          </button>
        </div>

        {/* Search */}
        <div className="bg-gray-700 border border-gray-600 p-4 mb-6">
          <input
            type="text"
            placeholder="Pesquisar por nome, email ou utilizador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500"
          />
        </div>

        {/* Table */}
        <div className="bg-gray-700 border border-gray-600 rounded-none overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow"></div>
            </div>
          ) : filteredUtilizadores.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {utilizadores.length === 0 ? "Nenhum utilizador registado" : "Nenhum utilizador encontrado"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-800 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-3">Nome de Utilizador</th>
                    <th className="px-6 py-3">Nome Completo</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Papel</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Último Login</th>
                    <th className="px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {filteredUtilizadores.map((utilizador) => (
                    <tr key={utilizador.id} className="hover:bg-gray-600 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-200">{utilizador.nome_utilizador}</td>
                      <td className="px-6 py-4 text-gray-300">{utilizador.nome_completo}</td>
                      <td className="px-6 py-4 text-gray-400">{utilizador.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-none ${papelBadgeClass(utilizador.papel)}`}>
                          {papelNome(utilizador.papel)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(utilizador)}
                          className={`px-3 py-1 text-xs font-bold rounded-none ${
                            utilizador.ativo
                              ? "bg-green-900 text-green-200 border border-green-700"
                              : "bg-red-900 text-red-200 border border-red-700"
                          }`}
                        >
                          {utilizador.ativo ? "Ativo" : "Inativo"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {utilizador.ultimo_login
                          ? new Date(utilizador.ultimo_login).toLocaleDateString("pt-PT")
                          : "Nunca"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(utilizador)}
                            className="px-3 py-1 bg-blue-900 text-blue-200 border border-blue-700 text-xs font-bold hover:bg-blue-800 transition-colors rounded-none"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(utilizador.id)}
                            className="px-3 py-1 bg-red-900 text-red-200 border border-red-700 text-xs font-bold hover:bg-red-800 transition-colors rounded-none"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 border border-gray-600 p-8 max-w-md w-full mx-4 rounded-none">
            <h3 className="text-2xl font-bold text-gray-100 mb-6">
              {isCreating ? "Novo Utilizador" : "Editar Utilizador"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome de Utilizador</label>
                <input
                  type="text"
                  value={formData.nome_utilizador}
                  onChange={(e) => setFormData({ ...formData, nome_utilizador: e.target.value })}
                  disabled={!isCreating}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="utilizador"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="Nome Completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Papel</label>
                <select
                  value={formData.papel}
                  onChange={(e) => setFormData({ ...formData, papel: e.target.value as any })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow"
                >
                  <option value="mecanico">Mecânico</option>
                  <option value="rececionista">Recepcionista</option>
                  <option value="gestor">Gestor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Palavra-passe{!isCreating && <span className="text-gray-500 font-normal"> (deixe vazio para manter)</span>}
                </label>
                <input
                  type="password"
                  value={formData.hash_palavra_passe}
                  onChange={(e) => setFormData({ ...formData, hash_palavra_passe: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder={isCreating ? "••••••••" : "Nova palavra-passe (opcional)"}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 text-gray-300 font-medium hover:bg-gray-600 transition-colors rounded-none"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-yellow-400 transition-colors rounded-none"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
