'use client';

import { MainLayout } from '../../components/layout/MainLayout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Producto, Cliente as PrismaCliente, Venta } from '@prisma/client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VentasReporte {
  totalVentas: number;
  ventasPorDia: Array<{
    fecha: string;
    total: number;
  }>;
}

interface Cliente extends PrismaCliente {
  ventas?: Venta[];
}

export default function DashboardPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [reporteVentas, setReporteVentas] = useState<VentasReporte | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar productos
        const productosResponse = await fetch('/api/productos');
        const productosData = await productosResponse.json();
        setProductos(productosData.data);

        // Cargar clientes
        const clientesResponse = await fetch('/api/clientes');
        const clientesData = await clientesResponse.json();
        setClientes(clientesData.data);

        // Cargar ventas
        const ventasResponse = await fetch('/api/ventas');
        const ventasData = await ventasResponse.json();
        setVentas(ventasData.data);

        // Cargar reporte de ventas
        const reporteResponse = await fetch('/api/ventas/reporte');
        const reporteData = await reporteResponse.json();
        setReporteVentas(reporteData.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const productosConBajoStock = productos.filter(p => p.stock <= 5).length;
  
  // Preparar datos para el gráfico
  const chartData = {
    labels: reporteVentas?.ventasPorDia.map(v => v.fecha) || [],
    datasets: [
      {
        label: 'Ventas por día',
        data: reporteVentas?.ventasPorDia.map(v => v.total) || [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Ventas por Día',
      },
    },
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Panel de Control</h1>
        
        {/* Primera fila de tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta de Productos */}
          <Link href="/productos">
            <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Productos</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {isLoading ? '...' : productos.length}
                        </div>
                        {productosConBajoStock > 0 && (
                          <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                            {productosConBajoStock} con bajo stock
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <div className="font-medium text-indigo-700 hover:text-indigo-900">
                    Ver todos los productos →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Tarjeta de Ventas */}
          <Link href="/ventas">
            <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Ventas</dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {isLoading ? '...' : `$${reporteVentas?.totalVentas.toFixed(2)}`}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <div className="font-medium text-green-700 hover:text-green-900">
                    Registrar nueva venta →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Tarjeta de Clientes */}
          <Link href="/clientes">
            <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Clientes</dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {isLoading ? '...' : clientes.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <div className="font-medium text-purple-700 hover:text-purple-900">
                    Ver todos los clientes →
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Gráfico de ventas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Ventas</h2>
          {!isLoading && reporteVentas && (
            <div className="h-64">
              <Line options={chartOptions} data={chartData} />
            </div>
          )}
        </div>

        {/* Últimas ventas y clientes frecuentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Últimas ventas */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimas Ventas</h2>
            <div className="space-y-4">
              {!isLoading && ventas.slice(0, 5).map((venta) => (
                <div key={venta.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Venta #{venta.id}</p>
                    <p className="text-sm text-gray-500">{new Date(venta.fecha).toLocaleDateString()}</p>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    ${venta.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clientes frecuentes */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Clientes Frecuentes</h2>
            <div className="space-y-4">
              {!isLoading && clientes
                .sort((a, b) => (b.ventas?.length || 0) - (a.ventas?.length || 0))
                .slice(0, 5)
                .map((cliente) => (
                  <div key={cliente.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cliente.nombre}</p>
                      <p className="text-sm text-gray-500">{cliente.documento}</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {cliente.ventas?.length || 0} compras
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 