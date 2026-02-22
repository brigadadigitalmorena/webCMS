/**
 * Generic Backend API Proxy
 *
 * Intercepts all requests to /api/backend/*, reads the access_token
 * from the HttpOnly cookie, and forwards the request to the real
 * backend with the Bearer token in the Authorization header.
 *
 * This ensures JWT never reaches client-side JavaScript.
 */
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function proxyRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const token = request.cookies.get("access_token")?.value;
  const path = params.path.join("/");

  // Build target URL preserving query string
  const url = new URL(`${BACKEND_URL}/${path}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  // Forward relevant headers
  const headers: HeadersInit = {};
  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Forward mobile-api headers if present (future-proof)
  const mobileApiVer = request.headers.get("x-mobile-api-version");
  if (mobileApiVer) headers["X-Mobile-Api-Version"] = mobileApiVer;

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  // Forward request body for non-GET methods
  if (request.method !== "GET" && request.method !== "HEAD") {
    fetchOptions.body = await request.arrayBuffer();
  }

  try {
    const backendRes = await fetch(url.toString(), fetchOptions);
    const responseBody = await backendRes.arrayBuffer();

    // Forward status + content type
    return new NextResponse(responseBody, {
      status: backendRes.status,
      headers: {
        "Content-Type":
          backendRes.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error(`[proxy] Failed to reach backend: ${path}`, error);
    return NextResponse.json(
      { detail: "Backend no disponible" },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
