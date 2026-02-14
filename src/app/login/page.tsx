"use client";

import LoginForm from "@/components/auth/login-form";
import { useTheme } from "@/contexts/theme-context";
import { Moon, Sun } from "lucide-react";

export default function LoginPage() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      {/* Theme toggle button - Top right corner */}
      {mounted && (
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className="p-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-md transition-all"
            title={
              theme === "light" ? "Activar modo oscuro" : "Activar modo claro"
            }
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Brigada CMS
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Panel Administrativo
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
