import express, { Request, Response, Router, NextFunction } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import { PrismaClient } from '../generated/prisma';
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();
const router = Router();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0'; // Permitir conexiones desde cualquier IP

// Variable global para controlar el estado de la sesión
let isAuthenticated = false;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

interface ParamsWithId {
  id: string;
}

interface ParamsWithFecha {
  fecha: string;
}

// Rutas de Productos
const createProducto: RequestHandler = async (req, res, next) => {
  try {
    const producto = await prisma.producto.create({
      data: req.body
    });
    res.json({ success: true, data: producto });
  } catch (error: any) {
    next(error);
  }
};

const getAllProductos: RequestHandler = async (_req, res, next) => {
  try {
    const productos = await prisma.producto.findMany();
    res.json({ success: true, data: productos });
  } catch (error: any) {
    next(error);
  }
};

const getProductoById: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'ID inválido' });
      return;
    }
    const producto = await prisma.producto.findUnique({
      where: { id }
    });
    if (!producto) {
      res.status(404).json({ success: false, message: 'Producto no encontrado' });
      return;
    }
    res.json({ success: true, data: producto });
  } catch (error) {
    next(error);
  }
};

const updateProducto: RequestHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.body.id);
    const producto = await prisma.producto.update({
      where: { id },
      data: req.body
    });
    res.json({ success: true, data: producto });
  } catch (error: any) {
    next(error);
  }
};

const updateProductoStock: RequestHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'ID inválido' });
      return;
    }

    // Primero verificar si el producto existe
    const productoExistente = await prisma.producto.findUnique({
      where: { id }
    });

    if (!productoExistente) {
      res.status(404).json({ 
        success: false, 
        message: `No se encontró el producto con ID ${id}` 
      });
      return;
    }

    const producto = await prisma.producto.update({
      where: { id },
      data: { stock: req.body.stock }
    });
    res.json({ success: true, data: producto });
  } catch (error: any) {
    next(error);
  }
};

const deleteProducto: RequestHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'ID inválido' });
      return;
    }
    await prisma.producto.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    next(error);
  }
};

interface ProductoVentaInput {
  productoId: number;
  cantidad: number;
}

// Rutas de Ventas
const createVenta: RequestHandler = async (req, res, next) => {
  try {
    // Primero, verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { documento: req.body.clienteDocumento }
    });

    if (!cliente) {
      res.status(400).json({ 
        success: false, 
        message: 'Cliente no encontrado' 
      });
      return;
    }

    // Obtener los productos y verificar stock
    const productosPromises = req.body.productos.map(async (prod: ProductoVentaInput) => {
      const producto = await prisma.producto.findUnique({
        where: { id: prod.productoId }
      });

      if (!producto) {
        throw new Error(`Producto con ID ${prod.productoId} no encontrado`);
      }

      if (producto.stock < prod.cantidad) {
        throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);
      }

      return {
        ...prod,
        precio: producto.precio,
        producto
      };
    });

    const productosConPrecios = await Promise.all(productosPromises);
    const total = productosConPrecios.reduce((sum, prod) => sum + (prod.precio * prod.cantidad), 0);

    // Crear la venta y actualizar stock en una transacción
    const venta = await prisma.$transaction(async (prisma) => {
      // Crear la venta
      const nuevaVenta = await prisma.venta.create({
        data: {
          total,
          metodoPago: req.body.metodoPago,
          documento: req.body.clienteDocumento,
          productos: {
            create: productosConPrecios.map(prod => ({
              productoId: prod.productoId,
              cantidad: prod.cantidad,
              precio: prod.precio
            }))
          }
        },
        include: {
          productos: true,
          cliente: true
        }
      });

      // Actualizar stock de productos
      for (const prod of productosConPrecios) {
        await prisma.producto.update({
          where: { id: prod.productoId },
          data: { stock: { decrement: prod.cantidad } }
        });
      }

      return nuevaVenta;
    });

    res.json({ success: true, data: venta });
  } catch (error: any) {
    if (error.message && error.message.includes('no encontrado') || error.message.includes('insuficiente')) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      next(error);
    }
  }
};

const getAllVentas: RequestHandler = async (_req, res, next) => {
  try {
    const ventas = await prisma.venta.findMany({
      include: {
        productos: true,
        cliente: true
      }
    });
    res.json({ success: true, data: ventas });
  } catch (error: any) {
    next(error);
  }
};

const getVentasReporte: RequestHandler = async (_req, res, next) => {
  try {
    const ventas = await prisma.venta.findMany({
      select: {
        total: true,
        fecha: true
      }
    });

    const totalVentas = ventas.reduce((sum: number, venta: VentaReporte) => sum + venta.total, 0);
    const ventasPorDiaMap = new Map<string, number>();

    ventas.forEach((venta: VentaReporte) => {
      const fecha = venta.fecha.toISOString().split('T')[0];
      const currentTotal = ventasPorDiaMap.get(fecha) || 0;
      ventasPorDiaMap.set(fecha, currentTotal + venta.total);
    });

    const ventasPorDia = Array.from(ventasPorDiaMap.entries()).map(([fecha, total]) => ({
      fecha,
      total
    }));

    const reporte: ReporteVentas = {
      totalVentas,
      ventasPorDia
    };

    res.json({ success: true, data: reporte });
  } catch (error: any) {
    next(error);
  }
};

const getVentaById: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'ID inválido' });
      return;
    }
    const venta = await prisma.venta.findUnique({
      where: { id },
      include: {
        productos: true,
        cliente: true
      }
    });
    if (!venta) {
      res.status(404).json({ success: false, message: 'Venta no encontrada' });
      return;
    }
    res.json({ success: true, data: venta });
  } catch (error) {
    next(error);
  }
};

const getVentasByFecha: RequestHandler<ParamsWithFecha> = async (req, res, next) => {
  try {
    const fecha = new Date(req.params.fecha);
    const ventas = await prisma.venta.findMany({
      where: {
        fecha: {
          gte: fecha,
          lt: new Date(fecha.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      include: {
        productos: true,
        cliente: true
      }
    });
    res.json({ success: true, data: ventas });
  } catch (error: any) {
    next(error);
  }
};

interface VentaReporte {
  total: number;
  fecha: Date;
}

interface ReporteVentas {
  totalVentas: number;
  ventasPorDia: Array<{
    fecha: string;
    total: number;
  }>;
}

// Rutas de Clientes
const createCliente: RequestHandler = async (req, res, next) => {
  try {
    // Verificar si ya existe un cliente con el mismo documento o email
    const existingCliente = await prisma.cliente.findFirst({
      where: {
        OR: [
          { documento: req.body.documento },
          { email: req.body.email }
        ]
      }
    });

    if (existingCliente) {
      const field = existingCliente.documento === req.body.documento ? 'documento' : 'email';
      res.status(400).json({
        success: false,
        message: `Ya existe un cliente con ese ${field}`,
        error: `El ${field} ya está registrado`
      });
      return;
    }

    const cliente = await prisma.cliente.create({
      data: req.body
    });
    res.json({ success: true, data: cliente });
  } catch (error: any) {
    next(error);
  }
};

const getAllClientes: RequestHandler = async (_req, res, next) => {
  try {
    const clientes = await prisma.cliente.findMany();
    res.json({ success: true, data: clientes });
  } catch (error: any) {
    next(error);
  }
};

const getClienteById: RequestHandler<ParamsWithId> = async (req, res, next) => {
  try {
    const documento = req.params.id;
    const cliente = await prisma.cliente.findUnique({
      where: {
        documento
      }
    });
    if (!cliente) {
      res.status(404).json({ success: false, message: 'Cliente no encontrado' });
      return;
    }
    res.json({ success: true, data: cliente });
  } catch (error: any) {
    next(error);
  }
};

// Credenciales hardcodeadas para admin
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: '12345678'
};

// Middleware de autenticación
const checkAuth: RequestHandler = (req, res, next): void => {
  // No requerir autenticación para login
  if (req.path === '/login') {
    next();
    return;
  }

  if (!isAuthenticated) {
    res.status(401).json({
      success: false,
      message: 'No autorizado. Debe iniciar sesión primero.'
    });
    return;
  }

  next();
};

// Ruta de login simplificada
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    isAuthenticated = true; // Establecer el estado de autenticación
    res.json({
      success: true,
      data: {
        username: 'admin',
        role: 'ADMIN'
      }
    });
  } else {
    isAuthenticated = false; // Asegurarse de que el estado sea falso si las credenciales son incorrectas
    res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
});

// Ruta para cerrar sesión
router.post('/logout', (req, res) => {
  isAuthenticated = false;
  res.json({
    success: true,
    message: 'Sesión cerrada correctamente'
  });
});

// Aplicar el middleware de autenticación a todas las rutas excepto login
router.use(checkAuth);

// Rutas sin autenticación
router.post('/productos', createProducto);
router.get('/productos', getAllProductos);
router.get('/productos/:id', getProductoById);
router.put('/productos', updateProducto);
router.patch('/productos/:id/stock', updateProductoStock);
router.delete('/productos/:id', deleteProducto);

router.post('/ventas', createVenta);
router.get('/ventas', getAllVentas);
router.get('/ventas/reporte', getVentasReporte);
router.get('/ventas/:id', getVentaById);
router.get('/ventas/fecha/:fecha', getVentasByFecha);

router.post('/clientes', createCliente);
router.get('/clientes', getAllClientes);
router.get('/clientes/:id', getClienteById);

// Montar el router en /api
app.use('/api', router);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Error handling middleware (debe ser el último)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message
  });
});

// Iniciar el servidor
app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
}); 