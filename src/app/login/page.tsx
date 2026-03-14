import LoginForm from "@/components/login/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Lado esquerdo - Branding (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <img src="/logo.png" alt="MQAuto Logo" className="w-24 h-24 object-contain" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">MQAuto</h1>
          <div className="w-16 h-1 bg-brand-yellow mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg">
            Área reservada a utilizadores autorizados.
          </p>
        </div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <LoginForm />
      </div>
    </div>
  );
}
