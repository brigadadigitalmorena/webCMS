/**
 * Auth Refresh Proxy
 *
 * Reads the refresh_token from the HttpOnly cookie, calls the
 * backend /auth/refresh, and updates both cookies with the new tokens.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_ROLE,
  USER_ROLE_COOKIE,
  isAdminRole,
} from "@/lib/auth/constants";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ACCESS_MAX_AGE = 60 * 30;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const userRole = request.cookies.get(USER_ROLE_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ detail: "No refresh token" }, { status: 401 });
  }

  if (!isAdminRole(userRole)) {
    const response = NextResponse.json(
      { detail: "Este acceso esta disponible solo para administradores" },
      { status: 403 },
    );

    response.cookies.set("access_token", "", {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    response.cookies.set(USER_ROLE_COOKIE, "", {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  }

  const backendRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!backendRes.ok) {
    // Refresh failed — clear cookies so middleware redirects to login
    const response = NextResponse.json(
      { detail: "Session expired" },
      { status: 401 },
    );
    response.cookies.set("access_token", "", {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    response.cookies.set(USER_ROLE_COOKIE, "", {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  const data = await backendRes.json();
  // data = { access_token, refresh_token } (with token rotation)

  const response = NextResponse.json({ success: true });

  response.cookies.set("access_token", data.access_token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });

  if (data.refresh_token) {
    response.cookies.set("refresh_token", data.refresh_token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_MAX_AGE,
    });
  }

  response.cookies.set(USER_ROLE_COOKIE, ADMIN_ROLE, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_MAX_AGE,
  });

  return response;
}
