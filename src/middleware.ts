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

  // ── Rutas públicas (sin auth) ────────────────────────────────────────────
  if (
    pathname.startsWith('/captura/login') ||
    pathname.startsWith('/api/captura/auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // ── Portal de captura (páginas y API propias) ────────────────────────────
  if (pathname.startsWith('/captura') || pathname.startsWith('/api/captura')) {
    const token = req.cookies.get('captura-session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.redirect(new URL('/captura/login', req.url));
    }
    return NextResponse.next();
  }

  // ── API compartida: acepta sesión principal O de captura ─────────────────
  const sharedApis = ['/api/barrios', '/api/puestos', '/api/colaboradores'];
  if (sharedApis.some((p) => pathname.startsWith(p))) {
    const mainToken    = req.cookies.get('session')?.value;
    const capturaToken = req.cookies.get('captura-session')?.value;
    if (
      (mainToken    && (await verifySession(mainToken)))    ||
      (capturaToken && (await verifySession(capturaToken)))
    ) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // ── App principal ────────────────────────────────────────────────────────
  const token = req.cookies.get('session')?.value;
  if (!token || !(await verifySession(token))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
