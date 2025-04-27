import express, { Request, Response, Router, RequestHandler, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();
const router = Router();
const PORT = process.env.PORT || 3000;

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

const getProductoById: RequestHandler<ParamsWithId> = async (req, res, next) => {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!producto) {
      res.status(404).json({ success: false, message: 'Producto no encontrado' });
      return;
    }
    res.json({ success: true, data: producto });
  } catch (error: any) {
    next(error);
  }
};

const updateProducto: RequestHandler = async (req, res, next) => {
  try {
    const producto = await prisma.producto.update({
      where: { id: req.body.id },
      data: req.body
    });
    res.json({ success: true, data: producto });
  } catch (error: any) {
    next(error);
  }
};

const updateProductoStock: RequestHandler<ParamsWithId> = async (req, res, next) => {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!producto) {
      res.status(404).json({ success: false, message: 'Producto no encontrado' });
      return;
    }

    const nuevoStock = producto.stock + req.body.cantidad;
    if (nuevoStock < 0) {
      res.status(400).json({ success: false, message: 'Stock insuficiente' });
      return;
    }

    const productoActualizado = await prisma.producto.update({
      where: { id: parseInt(req.params.id) },
      data: { stock: nuevoStock }
    });

    res.json({ success: true, data: productoActualizado });
  } catch (error: any) {
    next(error);
  }
};

const deleteProducto: RequestHandler<ParamsWithId> = async (req, res, next) => {
  try {
    await prisma.producto.delete({
      where: { id: parseInt(req.params.id) }
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
    const venta = await prisma.venta.create({
      data: {
        ...req.body,
        productos: {
          create: req.body.productos.map((prod: ProductoVentaInput) => ({
            productoId: prod.productoId,
            cantidad: prod.cantidad
          }))
        }
      },
      include: {
        productos: true
      }
    });
    res.json({ success: true, data: venta });
  } catch (error: any) {
    next(error);
  }
};

const getAllVentas: RequestHandler = async (_req, res, next) => {
  try {
    const ventas = await prisma.venta.findMany({
      include: {
        productos: true
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

const getVentaById: RequestHandler<ParamsWithId> = async (req, res, next) => {
  try {
    const venta = await prisma.venta.findUnique({
      where: { 
        id: parseInt(req.params.id)
      },
      include: {
        productos: true
      }
    });
    if (!venta) {
      res.status(404).json({ success: false, message: 'Venta no encontrada' });
      return;
    }
    res.json({ success: true, data: venta });
  } catch (error: any) {
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
        productos: true
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
    const cliente = await prisma.cliente.findUnique({
      where: { id: req.params.id }
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

// Rutas de Productos
router.post('/productos', createProducto);
router.get('/productos', getAllProductos);
router.get('/productos/:id', getProductoById);
router.put('/productos', updateProducto);
router.patch('/productos/:id/stock', updateProductoStock);
router.delete('/productos/:id', deleteProducto);

// Rutas de Ventas
router.post('/ventas', createVenta);
router.get('/ventas', getAllVentas);
router.get('/ventas/reporte', getVentasReporte);
router.get('/ventas/:id', getVentaById);
router.get('/ventas/fecha/:fecha', getVentasByFecha);

// Rutas de Clientes
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

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
}); 