import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VentasService, type Venta } from '@/app/services/api';
import { FaArrowLeft } from 'react-icons/fa';

interface Props {
  params: {
    action: string;
  };
}

export default function DetalleVentaPage({ params }: Props) {
  const router = useRouter();
  const [venta, setVenta] = useState<Venta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarVenta();
  }, []);

  const cargarVenta = async () => {
    try {
      setLoading(true);
      const data = await VentasService.getById(parseInt(params.action));
      setVenta(data);
    } catch (err) {
      setError('Error al cargar la venta');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Cargando...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!venta) return <div className="text-center p-8">Venta no encontrada</div>;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Detalle de Venta #{venta.id}</h1>
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Información General</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="text-gray-900">{new Date(venta.fecha).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full
                  ${venta.estado === 'completada' ? 'bg-green-100 text-green-800' : 
                    venta.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}
                >
                  {venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cliente ID</p>
                <p className="text-gray-900">{venta.clienteId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-gray-900 font-semibold">${venta.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Productos</h2>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Producto ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio Unitario
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {venta.productos.map((producto) => (
                    <tr key={producto.productoId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {producto.productoId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {producto.cantidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${producto.precioUnitario.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${(producto.cantidad * producto.precioUnitario).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 