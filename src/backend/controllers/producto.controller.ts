import { Request, Response, NextFunction } from 'express';
import { PrismaClient, type Producto } from '../../generated/prisma';

const prisma = new PrismaClient();

export const createProducto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, descripcion, precio, stock, categoria, fechaVencimiento } = req.body;

    // Validar campos requeridos
    if (!nombre || !categoria || precio === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion: descripcion || '',
        precio: parseFloat(precio),
        stock: parseInt(stock),
        categoria,
        fechaVencimiento: fechaVencimiento || null,
        stockMinimo: 5 // Valor por defecto
      }
    });

    res.status(201).json({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    next(error);
  }
};

export const getAllProductos = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const productos = await prisma.producto.findMany();

    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    next(error);
  }
};

export const getProductoById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(id) }
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    next(error);
  }
};

export const updateProducto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, stockMinimo } = req.body;

    const producto = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        stockMinimo: stockMinimo ? parseInt(stockMinimo) : undefined
      }
    });

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductoStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(id) }
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const nuevoStock = producto.stock + parseInt(cantidad);
    if (nuevoStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente'
      });
    }

    const productoActualizado = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: { stock: nuevoStock }
    });

    res.json({
      success: true,
      data: productoActualizado
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProducto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verificar si el producto tiene ventas asociadas
    const productoVentas = await prisma.detalleVenta.findFirst({
      where: { productoId: parseInt(id) }
    });

    if (productoVentas) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el producto porque tiene ventas asociadas'
      });
    }

    await prisma.producto.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

export const getProductosPorVencer = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 30); // Productos que vencen en los próximos 30 días

    const productos = await prisma.producto.findMany({
      where: {
        AND: [
          {
            fechaVencimiento: {
              not: null
            }
          },
          {
            fechaVencimiento: {
              lte: fechaLimite
            }
          }
        ]
      }
    });

    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    next(error);
  }
};

export const getProductosBajoStock = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        stock: {
          lte: 5
        }
      }
    });
    
    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    next(error);
  }
}; 