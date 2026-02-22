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
    // JWT is base64url-encoded: header.payload.signature
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;

    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf-8"),
    );

    if (!payload.exp) return false; // No expiry claim → trust it
    // exp is in seconds, Date.now() in milliseconds
    return payload.exp * 1000 < Date.now();
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
