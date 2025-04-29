import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Configuración global de axios
axios.defaults.withCredentials = true;

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirigir al login si no está autenticado
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Tipos
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  fechaVencimiento?: string | null;
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
    try {
      const response = await axios.get(`${API_URL}/productos`);
      return response.data || [];
    } catch (error) {
      console.error('Error en getAll productos:', error);
      return [];
    }
  },

  getById: async (id: number) => {
    const response = await axios.get(`${API_URL}/productos/${id}`);
    return response.data;
  },

  create: async (producto: Omit<Producto, 'id'>) => {
    try {
      // Validar que los campos numéricos sean números válidos
      const productoValidado = {
        ...producto,
        precio: Number(producto.precio),
        stock: Number(producto.stock)
      };

      // Validar que los campos requeridos no estén vacíos
      if (!productoValidado.nombre || !productoValidado.categoria) {
        throw new Error('Nombre y categoría son campos requeridos');
      }

      const response = await axios.post(`${API_URL}/productos`, productoValidado);
      return response.data;
    } catch (error) {
      console.error('Error en create producto:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al crear el producto');
      }
      throw error;
    }
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
    try {
      const response = await axios.get(`${API_URL}/productos/bajo-stock`);
      return response.data;
    } catch (error) {
      console.error('Error en getBajoStock:', error);
      return { data: [] };
    }
  },

  getPorVencer: async () => {
    try {
      const response = await axios.get(`${API_URL}/productos/por-vencer`);
      return response.data;
    } catch (error) {
      console.error('Error en getPorVencer:', error);
      return { data: [] };
    }
  },

  async getProductosBajoStock(): Promise<Producto[]> {
    try {
      const response = await fetch(`${API_URL}/productos/bajo-stock`);
      if (!response.ok) {
        throw new Error('Error al obtener productos con bajo stock');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getProductosBajoStock:', error);
      throw error;
    }
  },

  async getProductosPorVencer(): Promise<Producto[]> {
    try {
      const response = await fetch(`${API_URL}/productos/por-vencer`);
      if (!response.ok) {
        throw new Error('Error al obtener productos por vencer');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getProductosPorVencer:', error);
      throw error;
    }
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
    try {
      const response = await axios.get(`${API_URL}/ventas`);
      return response.data;
    } catch (error) {
      console.error('Error en getAll ventas:', error);
      return { data: [] };
    }
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
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${API_URL}/ventas/reporte`);
      
      console.log('Respuesta ventas del día:', response.data);
      
      // Filtramos las ventas del día actual
      const ventasHoy = response.data.data?.ventasPorDia
        ?.find((venta: any) => venta.fecha === hoy)?.total || 0;

      console.log('Ventas de hoy:', ventasHoy);
      return { success: true, data: { total: ventasHoy } };
    } catch (error) {
      console.error('Error en getVentasDelDia:', error);
      return { success: true, data: { total: 0 } };
    }
  },

  getVentasDelMes: async () => {
    try {
      const fecha = new Date();
      fecha.setDate(1);
      const primerDiaMes = fecha.toISOString().split('T')[0];
      const response = await axios.get(`${API_URL}/ventas/reporte`);
      
      console.log('Respuesta ventas del mes:', response.data);
      
      // Filtramos las ventas del mes actual
      const ventasDelMes = response.data.data?.ventasPorDia
        ?.filter((venta: any) => venta.fecha >= primerDiaMes)
        ?.reduce((total: number, venta: any) => total + (venta.total || 0), 0) || 0;

      console.log('Ventas del mes:', ventasDelMes);
      return { success: true, data: { total: ventasDelMes } };
    } catch (error) {
      console.error('Error en getVentasDelMes:', error);
      return { success: true, data: { total: 0 } };
    }
  },

  getReporte: async () => {
    try {
      const response = await axios.get(`${API_URL}/ventas/reporte`);
      return response.data;
    } catch (error) {
      console.error('Error en getReporte:', error);
      return { data: { ventasPorDia: [] } };
    }
  }
};

// Servicios de Autenticación
export const AuthService = {
  login: async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data;
  },

  logout: async () => {
    const response = await axios.post(`${API_URL}/logout`);
    return response.data;
  },

  checkSession: async () => {
    const response = await axios.get(`${API_URL}/check-session`);
    return response.data;
  }
}; 