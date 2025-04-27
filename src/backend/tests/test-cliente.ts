import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api';

async function testCliente() {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: 'Cliente Test',
        documento: `TEST${timestamp}`,
        telefono: '123456789',
        email: `test${timestamp}@test.com`
      })
    });

    const data = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testCliente(); 