import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener el token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No hay token de autenticación'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = decoded as { id: string; email: string; role: string };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

// Rutas que requieren autenticación
export const protectedRoutes = [
  '/api/productos',
  '/api/clientes',
  '/api/ventas',
];

// Rutas que requieren rol de administrador
export const adminRoutes = [
  '/api/usuarios',
];

export function isProtectedRoute(path: string): boolean {
  return protectedRoutes.some(route => path.startsWith(route));
}

export function isAdminRoute(path: string): boolean {
  return adminRoutes.some(route => path.startsWith(route));
} 