"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '../../components/layout/MainLayout';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { StockAlert } from '../../components/ui/StockAlert';
import { Producto } from '@prisma/client';
import { productosService } from '../../services/productos';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const ITEMS_PER_PAGE = 10;

export default function ProductosPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const response = await productosService.getAll();
      if (response.success) {
        setProductos(response.data);
      } else {
        setError(response.message || 'Error al cargar los productos');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (producto: Producto) => {
    if (window.confirm(`¿Está seguro de eliminar el producto ${producto.nombre}?`)) {
      try {
        const response = await productosService.delete(producto.id);
        if (response.success) {
          await loadProductos();
        } else {
          setError(response.message || 'Error al eliminar el producto');
        }
      } catch (err) {
        setError('Error al conectar con el servidor');
      }
    }
  };

  const filteredProductos = useMemo(() => {
    if (!searchTerm) return productos;
    
    const searchTermLower = searchTerm.toLowerCase();
    return productos.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(searchTermLower) ||
        producto.descripcion.toLowerCase().includes(searchTermLower)
    );
  }, [productos, searchTerm]);

  const columns = [
    { 
      header: 'Nombre',
      accessor: 'nombre' as keyof Producto,
      sortable: true
    },
    { 
      header: 'Descripción',
      accessor: 'descripcion' as keyof Producto,
      sortable: true
    },
    { 
      header: 'Precio',
      accessor: 'precio' as keyof Producto,
      sortable: true
    },
    { 
      header: 'Stock',
      accessor: (item: Producto) => (
        <span className={item.stock <= 5 ? 'text-red-600 font-medium' : ''}>
          {item.stock}
        </span>
      )
    },
    {
      header: 'Acciones',
      accessor: (item: Producto) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/productos/${item.id}`);
            }}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <StockAlert productos={productos} stockMinimo={5} />

          <div className="sm:flex sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Productos</h1>
            <Button
              onClick={() => router.push('/productos/nuevo')}
              className="mt-4 sm:mt-0"
            >
              Nuevo Producto
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="w-full sm:w-96">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nombre o descripción..."
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredProductos.length} productos encontrados
            </div>
          </div>

          {error && (
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
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <DataTable
              data={filteredProductos}
              columns={columns}
              onRowClick={(producto) => router.push(`/productos/${producto.id}`)}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
} 