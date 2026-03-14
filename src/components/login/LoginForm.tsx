"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/kanban");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/utilizadores/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao fazer login");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Erro de ligação ao servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-950 p-6 sm:p-8 rounded-lg shadow-lg w-full"
      >
        {/* Logo mobile */}
        <div className="flex flex-col items-center mb-6 lg:hidden">
          <img src="/logo.png" alt="MQAuto Logo" className="w-20 h-20 object-contain mb-2" />
          <h2 className="text-2xl font-bold text-white">MQAuto</h2>
        </div>

        <h3 className="text-xl font-semibold text-white text-center mb-6">
          Entrar na aplicação
        </h3>

        <div className="flex flex-col gap-4 mb-4">
          <label htmlFor="email" className="sr-only">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
            required
            autoComplete="email"
          />

          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-center text-red-400 mb-4 text-sm">{error}</p>
        )}

        {success && (
          <p className="text-center text-green-400 mb-4 text-sm">Login bem-sucedido! A redirecionar...</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-lg bg-brand-yellow text-gray-900 font-semibold hover:bg-brand-yellow-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "A entrar..." : "Entrar"}
        </button>

        <div className="mt-6 text-gray-500 text-xs text-center">
          &copy; 2026 MQAuto - Sistema de Gestão de Oficina
        </div>
      </form>
    </section>
  );
}
