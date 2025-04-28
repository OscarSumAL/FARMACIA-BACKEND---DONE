import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('isAuthenticated');
  const isAuthPage = request.nextUrl.pathname === '/login';

  // Si no está autenticado y no está en la página de login, redirigir a login
  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si está autenticado y está en la página de login, redirigir a productos
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/productos', request.url));
  }

  return NextResponse.next();
}

// Configurar las rutas que queremos proteger
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 