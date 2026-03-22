import { useAuthStore } from "@/store/auth-store";
import { UserRole } from "@/types";

interface UseRoleReturn {
  hasRole: boolean;
  role: UserRole | null;
  user: any;
  isAdmin: boolean;
  isEncargado: boolean;
  isBrigadista: boolean;
  isAuditor: boolean;
}

/**
 * Hook to check user role and permissions
 * @param allowedRoles - Optional array of roles to check against
 * @returns Object with role information and helper flags
 *
 * @example
 * // Check if user has admin or encargado role
 * const { hasRole } = useRole(['admin', 'encargado']);
 *
 * @example
 * // Get current role without checking
 * const { role, isAdmin } = useRole();
 */
export function useRole(allowedRoles?: UserRole[]): UseRoleReturn {
  const { user } = useAuthStore();

  const role = user?.rol || null;
  const hasRole = allowedRoles
    ? user
      ? allowedRoles.includes(user.rol)
      : false
    : true;

  return {
    hasRole,
    role,
    user,
    isAdmin: role === "admin",
    isEncargado: role === "encargado",
    isBrigadista: role === "brigadista",
    isAuditor: role === "auditor",
  };
}
