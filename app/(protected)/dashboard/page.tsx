'use client';

import { useEffect, useState } from 'react';
import { VentasService, ProductosService } from '@/app/services/api';
import { ExclamationTriangleIcon, CurrencyDollarIcon, ClockIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';

interface DashboardStats {
  ventasHoy: number;
  ventasMes: number;
  productosBajoStock: number;
  productosPorVencer: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    ventasHoy: 0,
    ventasMes: 0,
    productosBajoStock: 0,
    productosPorVencer: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ventasHoy, ventasMes, productosBajoStock, productosPorVencer] = await Promise.all([
        VentasService.getVentasDelDia(),
        VentasService.getVentasDelMes(),
        ProductosService.getBajoStock(),
        ProductosService.getPorVencer()
      ]);

      setStats({
        ventasHoy: ventasHoy.data?.total || 0,
        ventasMes: ventasMes.data?.total || 0,
        productosBajoStock: productosBajoStock.data?.length || 0,
        productosPorVencer: productosPorVencer.data?.length || 0
      });
    } catch (err) {
      console.error('Error completo:', err);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 800,
        color: '#1a1a1a',
        textTransform: 'uppercase',
        letterSpacing: '-0.5px',
        marginBottom: '2rem'
      }}>
        Panel de Control
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Ventas de Hoy */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#4b5563',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Ventas de Hoy
              </h2>
              <div style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                color: '#000000',
                letterSpacing: '-1px'
              }}>
                ${stats.ventasHoy.toFixed(2)}
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Card Ventas del Mes */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#4b5563',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Ventas del Mes
              </h2>
              <div style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                color: '#000000',
                letterSpacing: '-1px'
              }}>
                ${stats.ventasMes.toFixed(2)}
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Card Productos Bajo Stock */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#4b5563',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Productos Bajo Stock
              </h2>
              <div style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                color: '#000000',
                letterSpacing: '-1px'
              }}>
                {stats.productosBajoStock}
              </div>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <ArchiveBoxXMarkIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Card Productos por Vencer */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#4b5563',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Productos por Vencer
              </h2>
              <div style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                color: '#000000',
                letterSpacing: '-1px'
              }}>
                {stats.productosPorVencer}
              </div>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 