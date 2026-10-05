import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Backend-for-Frontend (BFF) Proxy Route Handler
 * Conforms to Doc 02 Section 1: Next.js BFF Architecture.
 * Forwards requests from client to FastAPI backend at http://127.0.0.1:8000/api/v1/...
 * Injects Authorization header from the secure HttpOnly cookie on the server-side.
 */

const BACKEND_BASE_URL = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8001/api/v1';
const SESSION_COOKIE_NAME = 'mahagov_bff_session';

async function handleProxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND_BASE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const bearerToken = sessionCookie ? sessionCookie.value : '';

  const headers = new Headers();
  headers.set('Content-Type', request.headers.get('Content-Type') || 'application/json');
  headers.set('X-Forwarded-Host', request.headers.get('Host') || 'localhost:3000');
  headers.set('X-BFF-Proxy-Enforced', 'NextJS-16-AppRouter');

  if (bearerToken) {
    headers.set('Authorization', `Bearer ${bearerToken}`);
  }

  let body: any = null;
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      body = await request.text();
    } catch {
      body = null;
    }
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: body || undefined
    });

    const data = await upstreamRes.text();
    const response = new NextResponse(data, {
      status: upstreamRes.status,
      headers: {
        'Content-Type': upstreamRes.headers.get('Content-Type') || 'application/json',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
      }
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'BFF Upstream Proxy Connection Failed',
        targetUrl,
        detail: error.message
      },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
