/**
 * Auth Login Proxy
 *
 * Receives JSON { email, password } from the client, forwards as
 * OAuth2 form-data to the backend, and sets the tokens as HttpOnly
 * cookies so they never reach JavaScript.
 */
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ACCESS_MAX_AGE = 60 * 30; // 30 min — matches backend default
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Backend expects OAuth2PasswordRequestForm (x-www-form-urlencoded)
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!backendRes.ok) {
      const error = await backendRes
        .json()
        .catch(() => ({ detail: "Error al iniciar sesión" }));
      return NextResponse.json(error, { status: backendRes.status });
    }

    const data = await backendRes.json();
    // data = { access_token, refresh_token, token_type, user }

    // Return user info only — tokens stay in HttpOnly cookies
    const response = NextResponse.json({ user: data.user });

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

    return response;
  } catch (error) {
    console.error("[auth/login proxy]", error);
    return NextResponse.json(
      { detail: "Error al iniciar sesión" },
      { status: 500 },
    );
  }
}
