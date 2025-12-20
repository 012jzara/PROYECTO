const express = require('express');
const router = express.Router();
const mascota = require('../controllers/mascotaController');
const { authenticate, permitirRoles, auditar } = require('../middlewares/authMiddleware');

const ROLES = ['Admin', 'Veterinario', 'Caja', 'Asistente'];

router.post('/',authenticate,permitirRoles(ROLES),auditar('MASCOTA_CREAR'),mascota.crearMascota);
router.get('/',authenticate,permitirRoles(ROLES),auditar('MASCOTA_LISTAR'),mascota.obtenerMascotas);
router.get('/cliente/:clienteId',authenticate,permitirRoles(ROLES),auditar('MASCOTA_POR_CLIENTE'),mascota.obtenerMascotasPorCliente);
router.get('/buscar/:texto',authenticate,permitirRoles(ROLES),auditar('MASCOTA_BUSCAR'),mascota.buscarMascota);
router.get('/:id',authenticate,permitirRoles(ROLES),auditar('MASCOTA_POR_ID'),mascota.obtenerMascotaPorId);
router.put('/:id',authenticate,permitirRoles(ROLES),auditar('MASCOTA_aCTUALIZAR'),mascota.actualizarMascota);
router.delete('/:id',authenticate,permitirRoles(['Admin']),auditar('MASCOTA_ELIMINAR'),mascota.eliminarMascota);

module.exports = router;
