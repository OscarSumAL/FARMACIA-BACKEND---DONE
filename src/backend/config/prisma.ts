import { PrismaClient } from '../../../src/generated/prisma';

// Crear una instancia global de PrismaClient para evitar múltiples conexiones
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
} 