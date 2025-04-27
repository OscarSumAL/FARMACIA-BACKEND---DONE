import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createCliente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, documento, telefono, email, direccion } = req.body;

    // Verificar si ya existe un cliente con el mismo documento o email
    const existingCliente = await prisma.cliente.findFirst({
      where: {
        OR: [
          { documento },
          { email: email || undefined }
        ]
      }
    });

    if (existingCliente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cliente con ese documento o email'
      });
    }

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        documento,
        telefono,
        email,
        direccion
      }
    });

    res.status(201).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    next(error);
  }
};

export const getAllClientes = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        ventas: true
      }
    });

    res.json({
      success: true,
      data: clientes
    });
  } catch (error) {
    next(error);
  }
};

export const getClienteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        ventas: true
      }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: cliente
    });
  } catch (error) {
    next(error);
  }
};

export const updateCliente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { nombre, documento, telefono, email, direccion } = req.body;

    // Verificar si existe otro cliente con el mismo documento o email
    const existingCliente = await prisma.cliente.findFirst({
      where: {
        OR: [
          { documento },
          { email: email || undefined }
        ],
        NOT: {
          id
        }
      }
    });

    if (existingCliente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe otro cliente con ese documento o email'
      });
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nombre,
        documento,
        telefono,
        email,
        direccion
      }
    });

    res.json({
      success: true,
      data: cliente
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCliente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verificar si el cliente tiene ventas asociadas
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        ventas: true
      }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    if (cliente.ventas.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el cliente porque tiene ventas asociadas'
      });
    }

    await prisma.cliente.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Cliente eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
}; 