const express = require('express');
const router = express.Router();
const compra = require('../controllers/compraController');
const { authenticate, permitirRoles, auditar } = require('../middlewares/authMiddleware');

const ROLES = ['Admin', 'Inventario', 'Caja'];

router.post('/',  authenticate,permitirRoles(ROLES),auditar('COMPRA_CREAR'),compra.crearCompra);
router.get('/', authenticate,permitirRoles(ROLES),auditar('COMPRA_LISTAR'),compra.obtenerCompras);
router.get('/rango',  authenticate,permitirRoles(ROLES),auditar('COMPRAS_POR_RANGO'),compra.obtenerComprasPorRango);
router.get('/reportes/resumen-proveedor',authenticate,permitirRoles(['Admin']), auditar('COMPRAS_RESUMEN_POR_PROVEEDOR'),compra.resumenComprasPorProveedor);
router.get('/reportes/resumen-periodo',authenticate,permitirRoles(['Admin']),auditar('COMPRAS_RESUMEN_POR_PERIODO'),compra.resumenComprasPorPeriodo);
router.get('/:id', authenticate,permitirRoles(ROLES),auditar('COMPRAS_OBTENER_POR_ID'), compra.obtenerCompraPorId);
router.put('/anular/:id',authenticate,permitirRoles(['Admin', 'Inventario']), auditar('COMPRA_ANULAR'), compra.anularCompra);

module.exports = router;
