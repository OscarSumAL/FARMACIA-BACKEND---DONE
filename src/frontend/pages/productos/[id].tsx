import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '../../components/layout/MainLayout';
import { ProductoForm } from '../../components/forms/ProductoForm';
import { productosService } from '../../services/productos';
import { Producto } from '../../types/api';

export default function EditarProductoPage() {
  const router = useRouter();
  const { id } = router.query;
  const [producto, setProducto] = useState<Producto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadProducto(parseInt(id));
    }
  }, [id]);

  const loadProducto = async (productoId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productosService.getById(productoId);
      
      if (response.success) {
        setProducto(response.data);
      } else {
        setError(response.message || 'Error al cargar el producto');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    if (!id || typeof id !== 'string') return;
    
    try {
      setIsSaving(true);
      setError(null);
      const response = await productosService.update(parseInt(id), formData);
      
      if (response.success) {
        router.push('/productos');
      } else {
        setError(response.message || 'Error al actualizar el producto');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error && !producto) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Editar Producto: {producto?.nombre}
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          {producto && (
            <ProductoForm
              initialData={producto}
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
              isLoading={isSaving}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
} 