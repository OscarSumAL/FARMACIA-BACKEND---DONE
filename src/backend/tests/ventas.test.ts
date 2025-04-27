import fetch from 'node-fetch';

const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api`;

interface Producto {
  productoId: number;
  cantidad: number;
}

interface Venta {
  id?: number;
  productos: Producto[];
  total: number;
  metodoPago: string;
  fecha: string;
  clienteId: string;
}

interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function testVentas() {
  console.log('\n=== PRUEBAS DE API DE VENTAS ===\n');

  try {
    // 0. Crear un cliente de prueba primero
    console.log('0. Creando cliente de prueba...');
    const timestamp = new Date().getTime();
    const nuevoCliente = {
      nombre: 'Cliente Test',
      documento: `TEST${timestamp}`,
      telefono: '123456789',
      email: `test${timestamp}@test.com`
    };

    const createClienteResponse = await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoCliente)
    });

    const clienteResult = await createClienteResponse.json() as APIResponse<{ id: string }>;
    console.log('Cliente creado:', clienteResult);
    const clienteId = clienteResult.data.id;

    // 1. Crear una nueva venta
    console.log('\n1. Creando nueva venta...');
    const nuevaVenta: Venta = {
      productos: [
        {
          productoId: 1,
          cantidad: 2
        }
      ],
      total: 25.00,
      metodoPago: 'efectivo',
      fecha: new Date().toISOString(),
      clienteId
    };

    const createResponse = await fetch(`${API_URL}/ventas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaVenta)
    });

    const createResult = await createResponse.json() as APIResponse<Venta>;
    console.log('Resultado:', createResult);
    const ventaId = createResult.data.id;

    // 2. Obtener todas las ventas
    console.log('\n2. Obteniendo lista de ventas...');
    const getAllResponse = await fetch(`${API_URL}/ventas`);
    const getAllResult = await getAllResponse.json() as APIResponse<Venta[]>;
    console.log('Ventas encontradas:', getAllResult.data.length);

    // 3. Obtener una venta específica
    console.log('\n3. Obteniendo venta específica...');
    const getOneResponse = await fetch(`${API_URL}/ventas/${ventaId}`);
    const getOneResult = await getOneResponse.json() as APIResponse<Venta>;
    console.log('Venta encontrada:', getOneResult.data);

    // 4. Obtener ventas por fecha
    console.log('\n4. Obteniendo ventas por fecha...');
    const fecha = new Date().toISOString().split('T')[0];
    const getByDateResponse = await fetch(`${API_URL}/ventas/fecha/${fecha}`);
    const getByDateResult = await getByDateResponse.json() as APIResponse<Venta[]>;
    console.log('Ventas del día:', getByDateResult.data.length);

    // 5. Obtener reporte de ventas
    console.log('\n5. Obteniendo reporte de ventas...');
    const reportResponse = await fetch(`${API_URL}/ventas/reporte`);
    const reportText = await reportResponse.text();
    console.log('Respuesta completa:', reportText);
    
    try {
      const reportResult = JSON.parse(reportText) as APIResponse<{
        totalVentas: number;
        ventasPorDia: { fecha: string; total: number }[];
      }>;
      console.log('Reporte de ventas:', reportResult.data);
    } catch (error) {
      console.error('Error al parsear el reporte:', error);
    }

  } catch (error) {
    console.error('Error en las pruebas:', error);
  }
}

// Ejecutar las pruebas
console.log('Iniciando pruebas de API de ventas...');
console.log('Asegúrate de que el servidor esté corriendo en http://localhost:3000');
console.log('Presiona Ctrl+C para detener las pruebas en cualquier momento');
testVentas();