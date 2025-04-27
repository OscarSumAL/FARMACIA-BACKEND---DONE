import { prisma } from '../config/prisma';
import { CreateProductoDTO, UpdateProductoDTO, ApiError } from '../types';
import { Producto } from '@prisma/client';

export class ProductoService {
  async findAll(): Promise<Producto[]> {
    return prisma.producto.findMany();
  }

  async findById(id: string): Promise<Producto | null> {
    return prisma.producto.findUnique({
      where: { id }
    });
  }

  async create(data: CreateProductoDTO): Promise<Producto> {
    return prisma.producto.create({
      data
    });
  }

  async update(id: string, data: UpdateProductoDTO): Promise<Producto> {
    const producto = await this.findById(id);
    if (!producto) {
      throw new ApiError(404, 'Producto no encontrado');
    }

    return prisma.producto.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    const producto = await this.findById(id);
    if (!producto) {
      throw new ApiError(404, 'Producto no encontrado');
    }

    // Verificar si el producto tiene ventas asociadas
    const ventasAsociadas = await prisma.detalleVenta.count({
      where: { productoId: id }
    });

    if (ventasAsociadas > 0) {
      throw new ApiError(400, 'No se puede eliminar el producto porque tiene ventas asociadas');
    }

    await prisma.producto.delete({
      where: { id }
    });
  }

  async findBajoStock(): Promise<Producto[]> {
    return prisma.producto.findMany({
      where: {
        stock: {
          lte: prisma.producto.fields.stockMinimo
        }
      }
    });
  }

  async actualizarStock(id: string, cantidad: number): Promise<Producto> {
    const producto = await this.findById(id);
    if (!producto) {
      throw new ApiError(404, 'Producto no encontrado');
    }

    if (producto.stock + cantidad < 0) {
      throw new ApiError(400, 'Stock insuficiente');
    }

    return prisma.producto.update({
      where: { id },
      data: {
        stock: {
          increment: cantidad
        }
      }
    });
  }
} 