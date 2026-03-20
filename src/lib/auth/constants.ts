export const ADMIN_ROLE = "admin";
export const ENCARGADO_ROLE = "encargado";
export const USER_ROLE_COOKIE = "user_role";

export function normalizeUserRole(role: unknown): string | null {
  return typeof role === "string" ? role.trim().toLowerCase() : null;
}

export function isAdminRole(role: unknown): boolean {
  return normalizeUserRole(role) === ADMIN_ROLE;
}

export function isCmsRole(role: unknown): boolean {
  const normalized = normalizeUserRole(role);
  return normalized === ADMIN_ROLE || normalized === ENCARGADO_ROLE;
}
