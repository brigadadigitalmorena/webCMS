export const ADMIN_ROLE = "admin";
export const USER_ROLE_COOKIE = "user_role";

export function normalizeUserRole(role: unknown): string | null {
  return typeof role === "string" ? role.trim().toLowerCase() : null;
}

export function isAdminRole(role: unknown): boolean {
  return normalizeUserRole(role) === ADMIN_ROLE;
}
