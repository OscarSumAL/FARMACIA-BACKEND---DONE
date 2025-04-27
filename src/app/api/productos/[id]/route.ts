import { NextResponse } from 'next/server';
import { ProductoService } from '@/backend/services/producto.service';
import { ApiResponse } from '@/backend/types';
import { ApiError } from '@/backend/types';

const productoService = new ProductoService();

// GET /api/productos/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const producto = await productoService.findById(params.id);
    if (!producto) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Producto no encontrado'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<typeof producto>>({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error al obtener el producto'
    }, { status: 500 });
  }
}

// DELETE /api/productos/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await productoService.delete(params.id);
    return NextResponse.json<ApiResponse<null>>({
      success: true
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: error.message
      }, { status: error.statusCode });
    }

    console.error('Error al eliminar producto:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error al eliminar el producto'
    }, { status: 500 });
  }
}

// PATCH /api/productos/[id]/stock
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const cantidad = Number(body.cantidad);

    if (isNaN(cantidad)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'La cantidad debe ser un número válido'
      }, { status: 400 });
    }

    const producto = await productoService.actualizarStock(params.id, cantidad);
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

    console.error('Error al actualizar stock:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error al actualizar el stock'
    }, { status: 500 });
  }
} 