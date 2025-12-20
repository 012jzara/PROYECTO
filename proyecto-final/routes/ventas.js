const express = require('express');
const router = express.Router();
const venta = require('../controllers/ventaController');
const { authenticate, permitirRoles, auditar } = require('../middlewares/authMiddleware');

const ROLES = ['Admin', 'Caja'];

router.post('/',authenticate, permitirRoles(ROLES),auditar('VENTA_CREAR'),venta.crearVenta);

router.get('/',authenticate, permitirRoles(['Admin', 'Caja', 'Veterinario']),auditar('VENTA_LISTAR'),venta.obtenerVentas);

router.get('/rango', authenticate,permitirRoles(['Admin', 'Caja']),auditar('VENTA_POR_RANGO'),venta.obtenerVentasPorRango);

router.get('/:id',authenticate,permitirRoles(['Admin', 'Caja', 'Veterinario']),auditar('VENTA_OBTENER_POR_ID'),venta.obtenerVentaPorId);

router.put('/:id/anular',authenticate,permitirRoles(['Admin']),auditar('VENTA_ANULAR'),venta.anularVenta);

module.exports = router;
