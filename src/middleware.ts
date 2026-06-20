import { NextRequest, NextResponse } from 'next/server';

const SECRET = process.env.AUTH_SECRET ?? 'campana-key-2024';

async function verifySession(token: string): Promise<boolean> {
  try {
    const raw = atob(token.replace(/-/g, '+').replace(/_/g, '/'));
    const i = raw.lastIndexOf(':');
    const username = raw.slice(0, i);
    const hashHex = raw.slice(i + 1);

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(username));
    const expected = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return hashHex === expected;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Portal de captura ────────────────────────────────────────────────────
  if (pathname.startsWith('/captura')) {
    if (
      pathname.startsWith('/captura/login') ||
      pathname.startsWith('/api/captura/auth')
    ) {
      return NextResponse.next();
    }
    const token = req.cookies.get('captura-session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.redirect(new URL('/captura/login', req.url));
    }
    return NextResponse.next();
  }

  // ── App principal ────────────────────────────────────────────────────────
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  const token = req.cookies.get('session')?.value;
  if (!token || !(await verifySession(token))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
