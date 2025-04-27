import fetch from 'node-fetch';

const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api`;

interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  stockMinimo: number;
}

interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function testProductos() {
  console.log('\n=== PRUEBAS DE API DE PRODUCTOS ===\n');

  try {
    // 1. Crear un nuevo producto
    console.log('1. Creando nuevo producto...');
    const nuevoProducto = {
      nombre: 'Aspirina',
      descripcion: 'Analgésico y antiinflamatorio',
      precio: 12.50,
      stock: 50,
      stockMinimo: 10
    };

    const createResponse = await fetch(`${API_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoProducto)
    });

    const createResult = await createResponse.json() as APIResponse<Producto>;
    console.log('Resultado:', createResult);
    const productoId = createResult.data.id;

    // 2. Obtener todos los productos
    console.log('\n2. Obteniendo lista de productos...');
    const getAllResponse = await fetch(`${API_URL}/productos`);
    const getAllResult = await getAllResponse.json() as APIResponse<Producto[]>;
    console.log('Productos encontrados:', getAllResult.data.length);

    // 3. Obtener un producto específico
    console.log('\n3. Obteniendo producto específico...');
    const getOneResponse = await fetch(`${API_URL}/productos/${productoId}`);
    const getOneResult = await getOneResponse.json() as APIResponse<Producto>;
    console.log('Producto encontrado:', getOneResult.data.nombre);

    // 4. Actualizar un producto
    console.log('\n4. Actualizando producto...');
    const updateData = {
      id: productoId,
      precio: 15.75,
      stock: 60
    };

    const updateResponse = await fetch(`${API_URL}/productos`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    const updateResult = await updateResponse.json() as APIResponse<Producto>;
    console.log('Producto actualizado:', updateResult.data);

    // 5. Actualizar stock
    console.log('\n5. Actualizando stock...');
    const stockUpdateResponse = await fetch(`${API_URL}/productos/${productoId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad: -5 }) // Reducir stock en 5 unidades
    });

    const stockUpdateResult = await stockUpdateResponse.json() as APIResponse<Producto>;
    console.log('Stock actualizado:', stockUpdateResult.data.stock);

    // 6. Intentar eliminar el producto
    console.log('\n6. Intentando eliminar producto...');
    const deleteResponse = await fetch(`${API_URL}/productos/${productoId}`, {
      method: 'DELETE'
    });

    const deleteResult = await deleteResponse.json() as APIResponse<{ message: string }>;
    console.log('Resultado de eliminación:', deleteResult);

  } catch (error) {
    console.error('Error en las pruebas:', error);
  }
}

// Ejecutar las pruebas
console.log('Iniciando pruebas de API...');
console.log('Asegúrate de que el servidor esté corriendo en http://localhost:3000');
console.log('Presiona Ctrl+C para detener las pruebas en cualquier momento');
testProductos(); 