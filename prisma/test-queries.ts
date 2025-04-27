import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n=======================================');
    console.log('       DATOS DE LA FARMACIA');
    console.log('=======================================\n');

    // Usuarios
    console.log('\n🔐 USUARIOS REGISTRADOS:');
    console.log('=======================================');
    const usuarios = await prisma.usuario.findMany();
    usuarios.forEach(usuario => {
      console.log(`Nombre: ${usuario.nombre}`);
      console.log(`Email: ${usuario.email}`);
      console.log(`Rol: ${usuario.role}`);
      console.log('---------------------------------------');
    });

    // Productos
    console.log('\n📦 INVENTARIO DE PRODUCTOS:');
    console.log('=======================================');
    const productos = await prisma.producto.findMany();
    productos.forEach(producto => {
      console.log(`Nombre: ${producto.nombre}`);
      console.log(`Descripción: ${producto.descripcion}`);
      console.log(`Precio: $${producto.precio.toFixed(2)}`);
      console.log(`Stock actual: ${producto.stock} unidades`);
      console.log(`Stock mínimo: ${producto.stockMinimo} unidades`);
      console.log('---------------------------------------');
    });

    // Clientes
    console.log('\n👥 REGISTRO DE CLIENTES:');
    console.log('=======================================');
    const clientes = await prisma.cliente.findMany();
    clientes.forEach(cliente => {
      console.log(`Nombre: ${cliente.nombre}`);
      console.log(`Documento: ${cliente.documento}`);
      console.log(`Teléfono: ${cliente.telefono || 'No registrado'}`);
      console.log(`Email: ${cliente.email || 'No registrado'}`);
      console.log(`Dirección: ${cliente.direccion || 'No registrada'}`);
      console.log('---------------------------------------');
    });

    // Ventas
    console.log('\n🧾 REGISTRO DE VENTAS:');
    console.log('=======================================');
    const ventas = await prisma.venta.findMany({
      include: {
        cliente: true,
        detalles: {
          include: {
            producto: true
          }
        }
      }
    });

    ventas.forEach(venta => {
      console.log(`Fecha: ${venta.fecha.toLocaleString()}`);
      console.log(`Cliente: ${venta.cliente.nombre}`);
      console.log('Productos:');
      venta.detalles.forEach(detalle => {
        console.log(`  • ${detalle.cantidad}x ${detalle.producto.nombre}`);
        console.log(`    Precio unitario: $${detalle.precioUnitario.toFixed(2)}`);
        console.log(`    Subtotal: $${detalle.subtotal.toFixed(2)}`);
      });
      console.log(`Total de la venta: $${venta.total.toFixed(2)}`);
      console.log('---------------------------------------');
    });

    // Estadísticas
    console.log('\n📊 ESTADÍSTICAS DEL SISTEMA:');
    console.log('=======================================');
    console.log(`Total de usuarios: ${usuarios.length}`);
    console.log(`Total de productos: ${productos.length}`);
    console.log(`Total de clientes: ${clientes.length}`);
    console.log(`Total de ventas: ${ventas.length}`);
    
    const totalVentas = ventas.reduce((sum, venta) => sum + venta.total, 0);
    console.log(`\nMonto total de ventas: $${totalVentas.toFixed(2)}`);

    const totalProductosVendidos = ventas.reduce((sum, venta) => 
      sum + venta.detalles.reduce((sum2, detalle) => sum2 + detalle.cantidad, 0), 0);
    console.log(`Total de productos vendidos: ${totalProductosVendidos} unidades`);

    const stockTotal = productos.reduce((sum, producto) => sum + producto.stock, 0);
    console.log(`Stock total en inventario: ${stockTotal} unidades`);

    const valorInventario = productos.reduce((sum, producto) => sum + (producto.stock * producto.precio), 0);
    console.log(`Valor total del inventario: $${valorInventario.toFixed(2)}`);

    // Alertas de stock
    console.log('\n⚠️ ALERTAS DE STOCK:');
    console.log('=======================================');
    const productosBajoMinimo = productos.filter(p => p.stock <= p.stockMinimo);
    if (productosBajoMinimo.length === 0) {
      console.log('No hay productos bajo el stock mínimo');
    } else {
      productosBajoMinimo.forEach(producto => {
        console.log(`¡ALERTA! ${producto.nombre}:`);
        console.log(`  • Stock actual: ${producto.stock} unidades`);
        console.log(`  • Stock mínimo: ${producto.stockMinimo} unidades`);
        console.log(`  • Necesita reposición: ${producto.stockMinimo - producto.stock} unidades`);
        console.log('---------------------------------------');
      });
    }

  } catch (error) {
    console.error('Error en las consultas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 