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
      console.log("Attempting login for:", email);
      const authUser = await authService.login({ email, password });
      console.log("Login successful, user:", authUser);
      login(authUser);

      // Set cookies for middleware
      document.cookie = `access_token=${authUser.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      console.error("Error response:", err.response);
      const errorMessage =
        err.response?.data?.detail || err.message || "Error al iniciar sesión";
      setError(errorMessage);
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
      // Clear cookies first
      document.cookie =
        "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

      // Clear auth state
      logout();

      // Force full page reload so middleware re-evaluates without the token
      window.location.href = "/login";
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
  const { isAuthenticated, isLoading, hasHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  // Safety net: if hasHydrated never fires within 4 seconds (e.g. another
  // storage edge case) wipe the key and redirect to login so the user is
  // never permanently stuck on the spinner.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!useAuthStore.getState().hasHydrated) {
        try {
          localStorage.removeItem("auth-storage");
        } catch (_) {}
        router.push("/login");
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (!hasHydrated || isLoading) {
      return;
    }

    if (!isAuthenticated) {
      setIsChecking(false);
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [hasHydrated, isAuthenticated, isLoading, router]);

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
