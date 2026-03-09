"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function CallbackRPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const run = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        localStorage.setItem("toconline_auth_error_reason", error);
        window.location.replace(`/faturacao?auth=error&reason=${encodeURIComponent(error)}`);
        return;
      }

      if (!code) {
        localStorage.setItem("toconline_auth_error_reason", "code ausente no callback");
        window.location.replace(`/faturacao?auth=error&reason=${encodeURIComponent("code ausente no callback")}`);
        return;
      }

      try {
        const response = await fetch("/api/fatura-simplificada", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload: {}, authCode: code })
        });

        const data = await response.json();
        const token = data?.data?.access_token;

        if (!response.ok || !data?.success || !token) {
          const reason =
            data?.error ||
            data?.details?.error ||
            `Falha ao obter access token (HTTP ${response.status}).`;
          throw new Error(reason);
        }

        localStorage.setItem("toconline_access_token", token);
        localStorage.setItem("toconline_token_timestamp", Date.now().toString());
        localStorage.removeItem("toconline_auth_error_reason");
        window.location.replace("/faturacao?auth=success");
      } catch (err) {
        const reason = err instanceof Error ? err.message : "Erro na autenticacao.";
        localStorage.setItem("toconline_auth_error_reason", reason);
        window.location.replace(`/faturacao?auth=error&reason=${encodeURIComponent(reason)}`);
      }
    };

    run();
  }, [searchParams]);

  return null;
}
