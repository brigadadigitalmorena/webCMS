import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/lib/api";

/**
 * Hook to handle authentication state
 */
export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    login,
    logout,
    setLoading,
  } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  /**
   * Login with credentials
   */
  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const authUser = await authService.login({ email, password });
      login(authUser);

      // Set cookies for middleware
      document.cookie = `access_token=${authUser.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al iniciar sesión");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      logout();

      // Clear cookies
      document.cookie =
        "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

      router.push("/login");
    }
  };

  /**
   * Verify and refresh user data
   */
  const refreshUser = async () => {
    try {
      const userData = await authService.me();
      setUser(userData);
    } catch (err) {
      console.error("Failed to refresh user:", err);
      handleLogout();
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    handleLogin,
    handleLogout,
    refreshUser,
  };
}

/**
 * Hook to protect routes - requires authentication
 */
export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        setIsChecking(false);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return { isChecking };
}

/**
 * Hook to check if user has specific role
 */
export function useRole(allowedRoles: string[]) {
  const { user } = useAuthStore();

  const hasRole = user ? allowedRoles.includes(user.rol) : false;

  return { hasRole, role: user?.rol };
}
