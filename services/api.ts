import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Configurar el cliente axios con las opciones necesarias
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para agregar token de autenticación si está disponible
apiClient.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      config.headers['Authorization'] = `Bearer ${userData.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/login', { email, password });
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post('/logout');
    return response.data;
  },
};

// Servicios de productos
export const productoService = {
  getAll: async () => {
    const response = await apiClient.get('/productos');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get(`/productos/${id}`);
    return response.data;
  },
  create: async (producto: any) => {
    const response = await apiClient.post('/productos', producto);
    return response.data;
  },
  update: async (id: number, producto: any) => {
    const response = await apiClient.put(`/productos/${id}`, producto);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await apiClient.delete(`/productos/${id}`);
    return response.data;
  },
  updateStock: async (id: number, cantidad: number) => {
    const response = await apiClient.patch(`/productos/${id}/stock`, { cantidad });
    return response.data;
  },
  getLowStock: async () => {
    const response = await apiClient.get('/productos/low-stock');
    return response.data;
  },
};

// Servicios de clientes
export const clienteService = {
  getAll: async () => {
    const response = await apiClient.get('/clientes');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/clientes/${id}`);
    return response.data;
  },
  create: async (cliente: any) => {
    const response = await apiClient.post('/clientes', cliente);
    return response.data;
  },
  update: async (id: string, cliente: any) => {
    const response = await apiClient.put(`/clientes/${id}`, cliente);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/clientes/${id}`);
    return response.data;
  },
};

// Servicios de ventas
export const ventaService = {
  getAll: async () => {
    const response = await apiClient.get('/ventas');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get(`/ventas/${id}`);
    return response.data;
  },
  create: async (venta: any) => {
    const response = await apiClient.post('/ventas', venta);
    return response.data;
  },
  getByFecha: async (fecha: string) => {
    const response = await apiClient.get(`/ventas/fecha/${fecha}`);
    return response.data;
  },
  getReporte: async () => {
    const response = await apiClient.get('/ventas/reporte');
    return response.data;
  },
  anular: async (id: number) => {
    const response = await apiClient.delete(`/ventas/${id}`);
    return response.data;
  },
}; 