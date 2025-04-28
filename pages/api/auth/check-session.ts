import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Verificar si existe la cookie de autenticación
  const isAuthenticated = req.cookies.isAuthenticated === 'true';

  if (!isAuthenticated) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  return res.json({ isAuthenticated: true });
} 