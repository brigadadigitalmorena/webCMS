import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/lib/api";
import { resetApiSession } from "@/lib/api/client";

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
      resetApiSession(); // Clear dead-session flag so apiClient works again
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
  const { isAuthenticated, isLoading, hasHydrated, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  // Safety net: if hasHydrated never fires within 4 seconds, redirect to login.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!useAuthStore.getState().hasHydrated) {
        try {
          localStorage.removeItem("auth-storage");
        } catch (_) {}
        window.location.href = "/login";
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Once Zustand hydrates, decide whether to show the dashboard or redirect.
  // We trust Zustand + the HttpOnly cookie here — the middleware already
  // blocks expired tokens server-side, and the interceptor handles 401s.
  useEffect(() => {
    if (!hasHydrated || isLoading) return;

    if (!isAuthenticated) {
      setIsChecking(false);
      window.location.href = "/login";
      return;
    }

    // Session looks good — unblock the UI immediately
    setIsChecking(false);
  }, [hasHydrated, isAuthenticated, isLoading]);

  return { isChecking };
}
