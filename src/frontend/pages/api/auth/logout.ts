import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const response = await fetch('http://localhost:4000/api/logout', {
      method: 'POST'
    });

    const data = await response.json();

    // Eliminar la cookie
    res.setHeader('Set-Cookie', 'isAuthenticated=; HttpOnly; Path=/; Max-Age=0');
    
    return res.json(data);
  } catch (error) {
    console.error('Error en el endpoint de logout:', error);
    return res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
} 