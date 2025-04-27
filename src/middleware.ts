import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedRoute, isAdminRoute } from './backend/middleware/auth.middleware';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Verificar si la ruta requiere autenticación
  if (isProtectedRoute(path) || isAdminRoute(path)) {
    const token = await getToken({ req: request });

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar rol de administrador para rutas admin
    if (isAdminRoute(path) && token.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
}; 