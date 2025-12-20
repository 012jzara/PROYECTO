const express = require('express');
const router = express.Router();
const pago = require('../controllers/pagoController');
const { authenticate, permitirRoles, auditar } = require('../middleware/authMiddleware');

const ROLES = ['Admin', 'Caja'];

router.post('/', authenticate, permitirRoles(ROLES),auditar('PAGO_CREAR'), pago.crearPago);
router.get('/', authenticate, permitirRoles (ROLES),auditar('PAGO_LISTAR'), pago.obtenerPagos);
router.get('/transaccion/:transaccionId', authenticate, permitirRoles (ROLES),auditar('PAGO_POR_TRANSACCION'),pago.obtenerPagosPorTransaccion);
router.get('/:id', authenticate, permitirRoles (ROLES), auditar('PAGO_OBTENER_POR_ID'), pago.obtenerPagoPorId);
router.delete('/:id', authenticate, permitirRoles (['Admin']), auditar('PAGO_ELIMINAR'), pago.eliminarPago);

module.exports = router;
