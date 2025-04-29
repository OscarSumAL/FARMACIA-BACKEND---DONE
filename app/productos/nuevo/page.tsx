'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductosService } from '@/app/services/api';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

export default function NuevoProductoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [producto, setProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: '',
    fechaVencimiento: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar campos requeridos
      if (!producto.nombre || !producto.categoria) {
        throw new Error('Nombre y categoría son campos requeridos');
      }

      // Validar campos numéricos
      if (!producto.precio || !producto.stock) {
        throw new Error('Precio y stock son campos requeridos');
      }

      // Preparar datos para enviar
      const productoParaEnviar = {
        ...producto,
        precio: Number(producto.precio),
        stock: Number(producto.stock),
        fechaVencimiento: producto.fechaVencimiento || null
      };

      // Validar que los números sean válidos
      if (isNaN(productoParaEnviar.precio) || isNaN(productoParaEnviar.stock)) {
        throw new Error('Precio y stock deben ser números válidos');
      }

      await ProductosService.create(productoParaEnviar);
      router.push('/productos');
    } catch (err) {
      console.error('Error al crear producto:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el producto');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProducto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={{
      padding: '2rem',
      backgroundColor: '#f3f4f6',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => router.back()}
            style={{
              color: '#4b5563',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#111827'}
            onMouseOut={(e) => e.currentTarget.style.color = '#4b5563'}
          >
            <FaArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#111827'
          }}>Nuevo Producto</h1>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '0.375rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          padding: '1.5rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={producto.nombre}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  color: '#111827'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Categoría
              </label>
              <select
                name="categoria"
                value={producto.categoria}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: 'white',
                  color: '#111827'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              >
                <option value="">Seleccione una categoría</option>
                <option value="Medicamentos">Medicamentos</option>
                <option value="Cuidado Personal">Cuidado Personal</option>
                <option value="Vitaminas">Vitaminas</option>
                <option value="Primeros Auxilios">Primeros Auxilios</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Precio
              </label>
              <input
                type="number"
                name="precio"
                value={producto.precio}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  color: '#111827'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={producto.stock}
                onChange={handleChange}
                required
                min="0"
                placeholder="0"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  color: '#111827'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={producto.descripcion}
                onChange={handleChange}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  resize: 'vertical',
                  color: '#111827'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                name="fechaVencimiento"
                value={producto.fechaVencimiento}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  color: '#111827'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              />
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#1d4ed8')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#2563eb')}
            >
              <FaSave style={{ width: '1rem', height: '1rem' }} />
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 