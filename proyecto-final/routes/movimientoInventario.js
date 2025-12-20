const express = require('express');
const router = express.Router();
const movimiento = require('../controllers/movimientoInventarioController');
const { authenticate, permitirRoles, auditar } = require('../middleware/authMiddleware');

const ROLES_INV = ['Admin', 'Inventario'];

router.post('/',authenticate,permitirRoles(ROLES_INV),auditar('MOVIMIENTO_CREAR'), movimiento.crearMovimiento);
router.post('/transferir',authenticate,permitirRoles(ROLES_INV),auditar('MOVIMIENTO_TRANSFERIR'), movimiento.transferir);
router.get('/',authenticate,permitirRoles(ROLES_INV),auditar('MOVIMIENTO_LISTAR'), movimiento.obtenerMovimientos);
router.get('/rango', authenticate,permitirRoles(ROLES_INV),auditar('MOVIMIENTO_POR_RANGO'),movimiento.obtenerMovimientosPorRango);
router.get('/producto/:id',authenticate,permitirRoles(ROLES_INV),auditar('MOVIMIENTO_POR_PRODUCTO'), movimiento.obtenerPorProducto);
router.get('/:id',authenticate,permitirRoles(ROLES_INV),auditar('MOVIMIENTO_POR_ID'), movimiento.obtenerMovimientoPorId);

module.exports = router;
