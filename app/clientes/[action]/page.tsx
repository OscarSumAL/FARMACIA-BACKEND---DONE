'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClientesService, type Cliente } from '@/app/services/api';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

interface Props {
  params: {
    action: string;
    id?: string;
  };
}

export default function ClienteForm({ params }: Props) {
  const router = useRouter();
  const isEditing = params.action === 'editar';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [cliente, setCliente] = useState<Partial<Cliente>>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: ''
  });

  useEffect(() => {
    if (isEditing && params.id) {
      cargarCliente(parseInt(params.id));
    }
  }, [isEditing, params.id]);

  const cargarCliente = async (id: number) => {
    try {
      setLoading(true);
      const data = await ClientesService.getById(id);
      setCliente(data);
    } catch (err) {
      setError('Error al cargar el cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditing && params.id) {
        await ClientesService.update(parseInt(params.id), cliente);
      } else {
        await ClientesService.create(cliente as Omit<Cliente, 'id'>);
      }
      router.push('/clientes');
    } catch (err) {
      setError('Error al guardar el cliente');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCliente(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="text-center p-8">Cargando...</div>;

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h1>
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

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={cliente.nombre}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Apellido
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={cliente.apellido}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={cliente.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={cliente.telefono}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dirección
              </label>
              <textarea
                name="direccion"
                value={cliente.direccion}
                onChange={handleChange}
                rows={3}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <FaSave className="w-4 h-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Cliente'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 