import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const createUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, nombre, password, role } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el usuario
    const usuario = await prisma.usuario.create({
      data: {
        email,
        nombre,
        password: hashedPassword,
        role: role || 'USER'
      }
    });

    // Eliminar la contraseña de la respuesta
    const { password: _, ...usuarioSinPassword } = usuario;

    res.status(201).json({
      success: true,
      data: usuarioSinPassword
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Buscar el usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      data: {
        token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          role: usuario.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const { password: _, ...usuarioSinPassword } = usuario;

    res.json({
      success: true,
      data: usuarioSinPassword
    });
  } catch (error) {
    next(error);
  }
};

export const updateUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, role } = req.body;

    // Verificar si el usuario tiene permisos
    if (req.user?.role !== 'ADMIN' && req.user?.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    let updateData: any = {
      nombre,
      email
    };

    // Si se proporciona una nueva contraseña, encriptarla
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Solo los administradores pueden cambiar roles
    if (role && req.user?.role === 'ADMIN') {
      updateData.role = role;
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: updateData
    });

    const { password: _, ...usuarioSinPassword } = usuario;

    res.json({
      success: true,
      data: usuarioSinPassword
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verificar si el usuario tiene permisos
    if (req.user?.role !== 'ADMIN' && req.user?.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    await prisma.usuario.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
}; 