export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  documento: string;
  telefono: string;
  email: string;
  direccion: string;
  createdAt: string;
  updatedAt: string;
}

export interface DetalleVenta {
  id: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  precio: number;
  producto?: Producto;
}

export interface Venta {
  id: number;
  clienteId: number;
  total: number;
  metodoPago: string;
  fecha: string;
  createdAt: string;
  updatedAt: string;
  cliente?: Cliente;
  detalles?: DetalleVenta[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
} 