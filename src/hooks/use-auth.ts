import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/lib/api";

/**
 * Hook to handle authentication state.
 *
 * Tokens are managed server-side via HttpOnly cookies — this hook
 * only deals with user profile data stored in Zustand.
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
   * Login with credentials.
   * The server-side proxy sets HttpOnly cookies — we only store the
   * user profile in Zustand.
   */
  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userProfile = await authService.login({ email, password });
      login(userProfile);
      router.push("/dashboard");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || "Error al iniciar sesión";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user.
   * The server-side proxy clears the HttpOnly cookies.
   */
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Best-effort — cookies are cleared server-side regardless
    } finally {
      logout();
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
    } catch {
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
