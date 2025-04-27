import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api';

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    usuario: {
      id: string;
      email: string;
      nombre: string;
      role: string;
    };
  };
  message?: string;
}

interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function testAuth() {
  console.log('\n=== PRUEBAS DE AUTENTICACIÓN ===\n');

  try {
    // 1. Crear un usuario de prueba
    console.log('1. Creando usuario de prueba...');
    const nuevoUsuario = {
      email: 'test@example.com',
      nombre: 'Usuario Test',
      password: 'password123',
      role: 'ADMIN'
    };

    const createResponse = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoUsuario)
    });

    const createResult = await createResponse.json() as APIResponse<typeof nuevoUsuario>;
    console.log('Resultado creación:', createResult);

    // 2. Intentar login con el usuario creado
    console.log('\n2. Probando login...');
    const loginResponse = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: nuevoUsuario.email,
        password: nuevoUsuario.password
      })
    });

    const loginResult = await loginResponse.json() as LoginResponse;
    console.log('Resultado login:', loginResult);

    if (loginResult.success && loginResult.data.token) {
      // 3. Probar una ruta protegida con el token
      console.log('\n3. Probando ruta protegida...');
      const protectedResponse = await fetch(`${API_URL}/productos`, {
        headers: {
          'Authorization': `Bearer ${loginResult.data.token}`
        }
      });

      const protectedResult = await protectedResponse.json();
      console.log('Resultado ruta protegida:', protectedResult);
    }

  } catch (error) {
    console.error('Error en las pruebas:', error);
  }
}

// Ejecutar las pruebas
console.log('Iniciando pruebas de autenticación...');
console.log('Asegúrate de que el servidor esté corriendo en http://localhost:3000');
console.log('Presiona Ctrl+C para detener las pruebas en cualquier momento');
testAuth(); 