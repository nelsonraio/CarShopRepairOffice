type CallbackPageProps = {
  searchParams?: Promise<{
    code?: string;
  }>;
};

export default async function CallbackPage({ searchParams }: CallbackPageProps) {
  const params = (await searchParams) || {};
  const code = params.code;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-6 md:p-10">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <h1 className="text-2xl font-semibold mb-3">Callback recebido</h1>
        <p className="text-slate-600 mb-6">
          Esta pagina mostra o parametro <code className="font-mono">code</code> recebido via URL.
        </p>

        {code ? (
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-slate-500">Parametro code</p>
            <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm">{code}</pre>
            <p className="text-xs text-slate-500">
              Exemplo: <code className="font-mono">/callback?code=ABC123</code>
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-amber-300 bg-amber-50 text-amber-900 p-4">
            Nenhum parametro <code className="font-mono">code</code> foi encontrado na URL.
          </div>
        )}
      </div>
    </main>
  );
}
