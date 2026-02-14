import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Brigada CMS</h1>
            <p className="text-gray-600 mt-2">Panel Administrativo</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
