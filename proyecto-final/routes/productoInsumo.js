const express = require('express');
const router = express.Router();
const producto = require('../controllers/productoController');;
const { authenticate, permitirRoles, auditar } = require('../middleware/authMiddleware');

const ROLES_INV = ['Admin', 'Inventario'];

router.post('/',authenticate,permitirRoles(ROLES_INV),auditar('PRODUCTO_CREAR'),producto.agregarProducto);
router.get('/',authenticate,permitirRoles(['Admin', 'Inventario', 'Caja', 'Veterinario']),auditar('PRODUCTO_LISTAR'),producto.obtenerProductos);
router.get('/buscar/:filtro', authenticate,permitirRoles(['Admin', 'Inventario', 'Caja', 'Veterinario']),auditar('PRODUCTO_BUSCAR'),producto.buscarProducto);
router.put('/movimiento/:id',authenticate,permitirRoles(ROLES_INV),auditar('PRODUCTO_MOVIMIENTO'),producto.movimientoProducto);
router.get('/:id',authenticate,permitirRoles(['Admin', 'Inventario', 'Caja', 'Veterinario']),auditar('PRODUCTO_POR_ID'),producto.obtenerProductoPorId);
router.put('/:id', authenticate, permitirRoles(ROLES_INV),auditar('PPRODUCTO_ACTUALIZAR'),producto.actualizarProducto);
router.delete('/:id', authenticate,permitirRoles(['Admin']),auditar('PRODUCTO_ELIMINAR'),producto.eliminarProducto);
router.get('/filtro/categoria/:categoria', producto.filtrarPorCategoria);
router.get('/filtro/tienda/:tienda', producto.filtrarPorTienda);
router.get('/stock/critico', producto.obtenerStockCritico);

module.exports = router;

