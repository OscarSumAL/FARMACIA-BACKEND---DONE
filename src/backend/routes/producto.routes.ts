import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { 
  createProducto, 
  getAllProductos, 
  getProductoById, 
  updateProducto,
  deleteProducto,
  getProductosPorVencer,
  getProductosBajoStock
} from '../controllers/producto.controller';

const router = Router();

// Middleware para manejar errores de rutas
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.post('/', asyncHandler(createProducto));
router.get('/', asyncHandler(getAllProductos));
router.get('/por-vencer', asyncHandler(getProductosPorVencer));
router.get('/bajo-stock', asyncHandler(getProductosBajoStock));
router.get('/:id', asyncHandler(getProductoById));
router.put('/:id', asyncHandler(updateProducto));
router.delete('/:id', asyncHandler(deleteProducto));

export default router; 