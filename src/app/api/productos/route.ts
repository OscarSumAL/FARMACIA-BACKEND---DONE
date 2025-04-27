import { NextResponse } from 'next/server';
import { ProductoService } from '@/backend/services/producto.service';
import { ApiResponse, CreateProductoDTO, UpdateProductoDTO } from '@/backend/types';
import { ApiError } from '@/backend/types';

const productoService = new ProductoService();

// GET /api/productos
export async function GET() {
  try {
    const productos = await productoService.findAll();
    return NextResponse.json<ApiResponse<typeof productos>>({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error al obtener los productos'
    }, { status: 500 });
  }
}

// POST /api/productos
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const productoData: CreateProductoDTO = {
      nombre: body.nombre,
      descripcion: body.descripcion,
      precio: Number(body.precio),
      stock: Number(body.stock),
      stockMinimo: Number(body.stockMinimo)
    };

    const producto = await productoService.create(productoData);
    return NextResponse.json<ApiResponse<typeof producto>>({
      success: true,
      data: producto
    }, { status: 201 });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error al crear el producto'
    }, { status: 500 });
  }
}

// PUT /api/productos
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const productoData: UpdateProductoDTO = {
      id: body.id,
      nombre: body.nombre,
      descripcion: body.descripcion,
      precio: body.precio ? Number(body.precio) : undefined,
      stock: body.stock ? Number(body.stock) : undefined,
      stockMinimo: body.stockMinimo ? Number(body.stockMinimo) : undefined
    };

    const producto = await productoService.update(productoData.id, productoData);
    return NextResponse.json<ApiResponse<typeof producto>>({
      success: true,
      data: producto
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: error.message
      }, { status: error.statusCode });
    }

    console.error('Error al actualizar producto:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error al actualizar el producto'
    }, { status: 500 });
  }
} 