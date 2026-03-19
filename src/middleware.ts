import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USER_ROLE_COOKIE, isAdminRole } from "@/lib/auth/constants";

/**
 * Next.js Middleware for route protection
 * Checks that the access_token cookie exists AND is not expired (JWT exp claim).
 *
 * Admin-only access is enforced here before rendering any dashboard route.
 */

function isTokenExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;

    // Convert base64url → standard base64 (Edge Runtime compatible)
    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));

    if (!payload.exp) return false;
    // exp is seconds, Date.now() is milliseconds — add 30s grace
    return payload.exp * 1000 < Date.now() - 30_000;
  } catch {
    return true; // Malformed token → treat as expired
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const userRole = request.cookies.get(USER_ROLE_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/login");
  const isProtectedRoute = pathname.startsWith("/dashboard");

  const hasValidToken = token && !isTokenExpired(token);
  const hasAdminRole = isAdminRole(userRole);

  // Block unauthenticated/expired users from protected routes
  if (!hasValidToken && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Clear potentially stale cookie
    if (token) response.cookies.delete("access_token");
    return response;
  }

  if (hasValidToken && isProtectedRoute && !hasAdminRole) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "admin_only");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    response.cookies.delete(USER_ROLE_COOKIE);
    return response;
  }

  // Redirect authenticated users away from login page
  if (hasValidToken && isAuthPage && hasAdminRole) {
    const redirect = request.nextUrl.searchParams.get("redirect");
    const targetUrl = redirect || "/dashboard";
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  if (hasValidToken && isAuthPage && !hasAdminRole) {
    const response = NextResponse.next();
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    response.cookies.delete(USER_ROLE_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
