'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VentasService, ProductosService, ClientesService, Producto, Cliente } from '@/services/api';
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';

interface ProductoVenta {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  nombre: string;
}

export default function NuevaVentaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoVenta[]>([]);
  const [clienteId, setClienteId] = useState<number>(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    calcularTotal();
  }, [productosSeleccionados]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [clientesData, productosData] = await Promise.all([
        ClientesService.getAll(),
        ProductosService.getAll()
      ]);
      setClientes(clientesData);
      setProductos(productosData);
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = () => {
    const nuevoTotal = productosSeleccionados.reduce((sum, item) => 
      sum + (item.cantidad * item.precioUnitario), 0
    );
    setTotal(nuevoTotal);
  };

  const agregarProducto = (productoId: number) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    const yaExiste = productosSeleccionados.find(p => p.productoId === productoId);
    if (yaExiste) return;

    setProductosSeleccionados([...productosSeleccionados, {
      productoId: producto.id,
      cantidad: 1,
      precioUnitario: producto.precio,
      nombre: producto.nombre
    }]);
  };

  const actualizarCantidad = (index: number, cantidad: number) => {
    const nuevosProductos = [...productosSeleccionados];
    nuevosProductos[index].cantidad = cantidad;
    setProductosSeleccionados(nuevosProductos);
  };

  const eliminarProducto = (index: number) => {
    setProductosSeleccionados(
      productosSeleccionados.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) {
      setError('Debe seleccionar un cliente');
      return;
    }
    if (productosSeleccionados.length === 0) {
      setError('Debe agregar al menos un producto');
      return;
    }

    try {
      setLoading(true);
      await VentasService.create({
        clienteId,
        fecha: new Date().toISOString(),
        total,
        estado: 'pendiente',
        productos: productosSeleccionados.map(({ productoId, cantidad, precioUnitario }) => ({
          productoId,
          cantidad,
          precioUnitario
        }))
      });
      router.push('/ventas');
    } catch (err) {
      setError('Error al registrar la venta');
      setLoading(false);
    }
  };

  if (loading && !productos.length) return <div className="text-center p-8">Cargando...</div>;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Nueva Venta</h1>
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de Cliente */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Cliente</h2>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={0}>Seleccione un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* Selección de Productos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Productos</h2>
              <select
                onChange={(e) => agregarProducto(Number(e.target.value))}
                className="block w-64 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value=""
              >
                <option value="">Agregar producto</option>
                {productos
                  .filter(p => !productosSeleccionados.find(ps => ps.productoId === p.id))
                  .map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="mt-4">
              {productosSeleccionados.map((producto, index) => (
                <div
                  key={producto.productoId}
                  className="flex items-center gap-4 p-4 border-b border-gray-200 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{producto.nombre}</p>
                    <p className="text-sm text-gray-500">
                      Precio: ${producto.precioUnitario.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      min="1"
                      value={producto.cantidad}
                      onChange={(e) => actualizarCantidad(index, Number(e.target.value))}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-32 text-right">
                    ${(producto.cantidad * producto.precioUnitario).toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarProducto(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {productosSeleccionados.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay productos seleccionados
                </div>
              )}

              {productosSeleccionados.length > 0 && (
                <div className="flex justify-end items-center mt-4 pt-4 border-t border-gray-200">
                  <div className="text-lg font-semibold">
                    Total: ${total.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <FaSave className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Registrar Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 