const express = require('express');
const router = express.Router();
const servicio = require('../controllers/servicioController');
const { authenticate, permitirRoles, auditar } = require('../middleware/authMiddleware');

router.post('/',authenticate,permitirRoles(['Admin']),auditar('CREAR_SERVICIO'),servicio.crearServicio);
router.get('/',authenticate,permitirRoles(['Admin', 'Veterinario', 'Caja', 'Inventario', 'Asistente']),auditar('LISTAR_SERVICIO'),servicio.obtenerServicios);
router.get('/buscar/:texto',authenticate,permitirRoles(['Admin', 'Veterinario', 'Caja', 'Inventario', 'Asistente', 'User']),auditar('BUSCAR_SERVICIO'),servicio.buscarServicio);
router.get('/:id',authenticate,permitirRoles(['Admin', 'Veterinario', 'Caja', 'Inventario', 'Asistente']),auditar('OBTENER_ID_POR_SERVICIO'),servicio.obtenerServicioPorId);
router.put('/:id',authenticate,permitirRoles(['Admin']),auditar('ACTUALIZAR_SERVICIO'),servicio.actualizarServicio);
router.put('/:id/activar',authenticate,permitirRoles(['Admin']),auditar('ACTIVAR_SERVICIO'),servicio.activarServicio);
router.put('/:id/desactivar',authenticate,permitirRoles(['Admin']),auditar('DESACTIVAR_SERVICIO'),servicio.desactivarServicio);
router.delete('/:id',authenticate,permitirRoles(['Admin']),auditar('ELIMINAR_SERVICIO'),servicio.eliminarServicio);

module.exports = router;
