import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Tipos
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  fechaVencimiento?: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
}

export interface Venta {
  id: number;
  clienteId: number;
  fecha: string;
  total: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
  productos: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
  }[];
}

// Servicios de Productos
export const ProductosService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/productos`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axios.get(`${API_URL}/productos/${id}`);
    return response.data;
  },

  create: async (producto: Omit<Producto, 'id'>) => {
    const response = await axios.post(`${API_URL}/productos`, producto);
    return response.data;
  },

  update: async (id: number, producto: Partial<Producto>) => {
    const response = await axios.put(`${API_URL}/productos/${id}`, producto);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axios.delete(`${API_URL}/productos/${id}`);
    return response.data;
  },

  getBajoStock: async () => {
    const response = await axios.get(`${API_URL}/productos/bajo-stock`);
    return response.data;
  },

  getPorVencer: async () => {
    const response = await axios.get(`${API_URL}/productos/por-vencer`);
    return response.data;
  }
};

// Servicios de Clientes
export const ClientesService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/clientes`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axios.get(`${API_URL}/clientes/${id}`);
    return response.data;
  },

  create: async (cliente: Omit<Cliente, 'id'>) => {
    const response = await axios.post(`${API_URL}/clientes`, cliente);
    return response.data;
  },

  update: async (id: number, cliente: Partial<Cliente>) => {
    const response = await axios.put(`${API_URL}/clientes/${id}`, cliente);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axios.delete(`${API_URL}/clientes/${id}`);
    return response.data;
  }
};

// Servicios de Ventas
export const VentasService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/ventas`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axios.get(`${API_URL}/ventas/${id}`);
    return response.data;
  },

  create: async (venta: Omit<Venta, 'id'>) => {
    const response = await axios.post(`${API_URL}/ventas`, venta);
    return response.data;
  },

  update: async (id: number, venta: Partial<Venta>) => {
    const response = await axios.put(`${API_URL}/ventas/${id}`, venta);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axios.delete(`${API_URL}/ventas/${id}`);
    return response.data;
  },

  getVentasDelDia: async () => {
    const response = await axios.get(`${API_URL}/ventas/del-dia`);
    return response.data;
  },

  getVentasDelMes: async () => {
    const response = await axios.get(`${API_URL}/ventas/del-mes`);
    return response.data;
  }
}; 