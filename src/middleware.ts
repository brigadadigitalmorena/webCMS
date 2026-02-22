import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware for route protection
 * Checks that the access_token cookie exists AND is not expired (JWT exp claim).
 *
 * Note: Role-based checks are handled client-side via useRole hook
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
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/login");
  const isProtectedRoute = pathname.startsWith("/dashboard");

  const hasValidToken = token && !isTokenExpired(token);

  // Block unauthenticated/expired users from protected routes
  if (!hasValidToken && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Clear potentially stale cookie
    if (token) response.cookies.delete("access_token");
    return response;
  }

  // Redirect authenticated users away from login page
  if (hasValidToken && isAuthPage) {
    const redirect = request.nextUrl.searchParams.get("redirect");
    const targetUrl = redirect || "/dashboard";
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
