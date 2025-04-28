import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const response = await fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: req.body.username,
        password: req.body.password
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'Error de autenticación' });
    }

    // Establecer la cookie
    res.setHeader('Set-Cookie', `isAuthenticated=true; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}`);
    
    return res.json(data);
  } catch (error) {
    console.error('Error en el endpoint de login:', error);
    return res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
} 