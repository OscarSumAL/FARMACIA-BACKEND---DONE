import { Producto } from '../types/api';
import { api } from './api';

export const productosService = {
  getAll: () => api.get<Producto[]>('/productos'),
  
  getById: (id: number) => api.get<Producto>(`/productos/${id}`),
  
  create: (producto: Omit<Producto, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Producto>('/productos', producto),
  
  update: (id: number, producto: Partial<Producto>) =>
    api.put<Producto>(`/productos/${id}`, producto),
  
  updateStock: (id: number, stock: number) =>
    api.patch<Producto>(`/productos/${id}/stock`, { stock }),
  
  delete: (id: number) => api.delete<void>(`/productos/${id}`),
}; 