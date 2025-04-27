import { PrismaClient } from '../src/generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpiar la base de datos
  await prisma.detalleVenta.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('🗑️ Base de datos limpiada');

  // Crear usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@farmacia.com',
      nombre: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('👤 Usuario administrador creado:', admin.email);

  // Crear productos
  const productos = await Promise.all([
    prisma.producto.create({
      data: {
        nombre: 'Paracetamol',
        descripcion: 'Analgésico y antipirético',
        precio: 15.50,
        stock: 100,
        stockMinimo: 20,
      },
    }),
    prisma.producto.create({
      data: {
        nombre: 'Ibuprofeno',
        descripcion: 'Antiinflamatorio no esteroideo',
        precio: 25.80,
        stock: 80,
        stockMinimo: 15,
      },
    }),
    prisma.producto.create({
      data: {
        nombre: 'Omeprazol',
        descripcion: 'Inhibidor de la bomba de protones',
        precio: 45.90,
        stock: 50,
        stockMinimo: 10,
      },
    }),
  ]);

  console.log('💊 Productos creados:', productos.length);

  // Crear clientes
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        nombre: 'Juan Pérez',
        documento: 'DNI12345678',
        telefono: '999888777',
        email: 'juan@email.com',
        direccion: 'Av. Principal 123',
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: 'María García',
        documento: 'DNI87654321',
        telefono: '999777666',
        email: 'maria@email.com',
        direccion: 'Jr. Secundario 456',
      },
    }),
  ]);

  console.log('👥 Clientes creados:', clientes.length);

  // Crear ventas con detalles
  const venta1 = await prisma.venta.create({
    data: {
      clienteId: clientes[0].id,
      total: 56.80,
      detalles: {
        create: [
          {
            productoId: productos[0].id,
            cantidad: 2,
            precioUnitario: 15.50,
            subtotal: 31.00,
          },
          {
            productoId: productos[1].id,
            cantidad: 1,
            precioUnitario: 25.80,
            subtotal: 25.80,
          },
        ],
      },
    },
    include: {
      detalles: true,
    },
  });

  const venta2 = await prisma.venta.create({
    data: {
      clienteId: clientes[1].id,
      total: 91.80,
      detalles: {
        create: [
          {
            productoId: productos[2].id,
            cantidad: 2,
            precioUnitario: 45.90,
            subtotal: 91.80,
          },
        ],
      },
    },
    include: {
      detalles: true,
    },
  });

  console.log('🧾 Ventas creadas:', [venta1, venta2].length);

  // Actualizar stock de productos
  await Promise.all([
    prisma.producto.update({
      where: { id: productos[0].id },
      data: { stock: 98 }, // 100 - 2
    }),
    prisma.producto.update({
      where: { id: productos[1].id },
      data: { stock: 79 }, // 80 - 1
    }),
    prisma.producto.update({
      where: { id: productos[2].id },
      data: { stock: 48 }, // 50 - 2
    }),
  ]);

  console.log('📦 Stock de productos actualizado');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 