import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const createVenta = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productos, total, metodoPago, clienteId } = req.body;

    // Verificar el stock de cada producto
    for (const prod of productos) {
      const producto = await prisma.producto.findUnique({
        where: { id: prod.productoId }
      });

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: `Producto con ID ${prod.productoId} no encontrado`
        });
      }

      if (producto.stock < prod.cantidad) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para el producto ${producto.nombre}`
        });
      }
    }

    // Crear la venta y actualizar el stock en una transacción
    const venta = await prisma.$transaction(async (tx: PrismaClient) => {
      // Crear la venta
      const venta = await tx.venta.create({
        data: {
          total,
          metodoPago,
          clienteId,
          productos: {
            create: productos.map((prod: any) => ({
              productoId: prod.productoId,
              cantidad: prod.cantidad
            }))
          }
        },
        include: {
          productos: true
        }
      });

      // Actualizar el stock de cada producto
      for (const prod of productos) {
        await tx.producto.update({
          where: { id: prod.productoId },
          data: {
            stock: {
              decrement: prod.cantidad
            }
          }
        });
      }

      return venta;
    });

    res.status(201).json({
      success: true,
      data: venta
    });
  } catch (error) {
    next(error);
  }
};

export const getAllVentas = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const ventas = await prisma.venta.findMany({
      include: {
        productos: true,
        cliente: true
      }
    });

    res.json({
      success: true,
      data: ventas
    });
  } catch (error) {
    next(error);
  }
};

export const getVentaById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const venta = await prisma.venta.findUnique({
      where: { id: parseInt(id) },
      include: {
        productos: true,
        cliente: true
      }
    });

    if (!venta) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    res.json({
      success: true,
      data: venta
    });
  } catch (error) {
    next(error);
  }
};

export const getVentasByFecha = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fecha } = req.params;
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + 1);

    const ventas = await prisma.venta.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
          lt: fechaFin
        }
      },
      include: {
        productos: true,
        cliente: true
      }
    });

    res.json({
      success: true,
      data: ventas
    });
  } catch (error) {
    next(error);
  }
};

export const getVentasReporte = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const ventas = await prisma.venta.findMany({
      select: {
        total: true,
        fecha: true
      }
    });

    const totalVentas = ventas.reduce((sum: number, venta: { total: number }) => sum + venta.total, 0);
    const ventasPorDia = ventas.reduce((acc: Record<string, number>, venta: { total: number, fecha: Date }) => {
      const fecha = venta.fecha.toISOString().split('T')[0];
      acc[fecha] = (acc[fecha] || 0) + venta.total;
      return acc;
    }, {});

    const reporte = {
      totalVentas,
      ventasPorDia: Object.entries(ventasPorDia).map(([fecha, total]) => ({
        fecha,
        total
      }))
    };

    res.json({
      success: true,
      data: reporte
    });
  } catch (error) {
    next(error);
  }
};

export const anularVenta = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Obtener la venta con sus productos
    const venta = await prisma.venta.findUnique({
      where: { id: parseInt(id) },
      include: {
        productos: true
      }
    });

    if (!venta) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    // Restaurar el stock en una transacción
    await prisma.$transaction(async (tx: PrismaClient) => {
      // Restaurar el stock de cada producto
      for (const prodVenta of venta.productos) {
        await tx.producto.update({
          where: { id: prodVenta.productoId },
          data: {
            stock: {
              increment: prodVenta.cantidad
            }
          }
        });
      }

      // Eliminar los registros de ProductoVenta
      await tx.productoVenta.deleteMany({
        where: { ventaId: parseInt(id) }
      });

      // Eliminar la venta
      await tx.venta.delete({
        where: { id: parseInt(id) }
      });
    });

    res.json({
      success: true,
      message: 'Venta anulada correctamente'
    });
  } catch (error) {
    next(error);
  }
}; 