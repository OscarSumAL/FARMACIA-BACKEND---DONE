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
  const hashedPassword = await bcrypt.hash('12345678', 10);
  
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      nombre: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log('Usuario admin creado:', admin);

  // Crear productos con bajo stock
  const paracetamol = await prisma.producto.create({
    data: {
      nombre: 'Paracetamol',
      descripcion: 'Analgésico y antipirético',
      precio: 5.99,
      stock: 3,
      stockMinimo: 10,
      fechaVencimiento: new Date('2024-12-31')
    }
  });

  const ibuprofeno = await prisma.producto.create({
    data: {
      nombre: 'Ibuprofeno',
      descripcion: 'Antiinflamatorio',
      precio: 8.99,
      stock: 15,
      stockMinimo: 20,
      fechaVencimiento: new Date('2024-05-15') // Próximo a vencer
    }
  });

  const amoxicilina = await prisma.producto.create({
    data: {
      nombre: 'Amoxicilina',
      descripcion: 'Antibiótico',
      precio: 12.99,
      stock: 2,
      stockMinimo: 8,
      fechaVencimiento: new Date('2024-04-01') // Próximo a vencer
    }
  });

  console.log('💊 Productos creados');

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
      documento: clientes[0].documento,
      total: 20.97, // 2 paracetamol + 1 ibuprofeno
      metodoPago: 'efectivo',
      productos: {
        create: [
          {
            productoId: paracetamol.id,
            cantidad: 2,
            precio: paracetamol.precio
          },
          {
            productoId: ibuprofeno.id,
            cantidad: 1,
            precio: ibuprofeno.precio
          },
        ],
      },
    },
    include: {
      productos: true,
    },
  });

  const venta2 = await prisma.venta.create({
    data: {
      documento: clientes[1].documento,
      total: 25.98, // 2 amoxicilina
      metodoPago: 'tarjeta',
      productos: {
        create: [
          {
            productoId: amoxicilina.id,
            cantidad: 2,
            precio: amoxicilina.precio
          },
        ],
      },
    },
    include: {
      productos: true,
    },
  });

  console.log('🧾 Ventas creadas:', [venta1, venta2].length);

  // Actualizar stock de productos después de las ventas
  await Promise.all([
    prisma.producto.update({
      where: { id: paracetamol.id },
      data: { stock: paracetamol.stock - 2 },
    }),
    prisma.producto.update({
      where: { id: ibuprofeno.id },
      data: { stock: ibuprofeno.stock - 1 },
    }),
    prisma.producto.update({
      where: { id: amoxicilina.id },
      data: { stock: amoxicilina.stock - 2 },
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