// Tipos para las respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// DTOs (Data Transfer Objects)
export interface CreateProductoDTO {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  stockMinimo: number;
}

export interface UpdateProductoDTO extends Partial<CreateProductoDTO> {
  id: string;
}

export interface CreateClienteDTO {
  nombre: string;
  documento: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface UpdateClienteDTO extends Partial<CreateClienteDTO> {
  id: string;
}

export interface DetalleVentaDTO {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CreateVentaDTO {
  clienteId: string;
  detalles: DetalleVentaDTO[];
  total: number;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// Tipos para el manejo de errores
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
} 