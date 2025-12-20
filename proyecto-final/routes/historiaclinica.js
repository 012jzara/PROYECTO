const express = require('express');
const router = express.Router();
const historia = require('../controllers/historiaClinicaController');
const { authenticate, permitirRoles, auditar } = require('../middlewares/authMiddleware');

router.post('/',  authenticate,permitirRoles(['Admin', 'Veterinario']),auditar('HISTORIACLI_CREAR'), historia.crearHistoria);
router.get('/', authenticate,permitirRoles(['Admin', 'Veterinario', 'Asistente']),auditar('HISTORIACLI_LISTAR'), historia.obtenerHistorias);
router.get('/mascota/:mascotaId',authenticate,permitirRoles(['Admin', 'Veterinario', 'Asistente']),auditar('HISTORIACLI_POR_MASCOTA'),historia.obtenerHistoriaPorMascota);
router.get('/:id',authenticate,permitirRoles(['Admin', 'Veterinario', 'Asistente']),auditar('HISTORIACLI_POR_ID'), historia.obtenerHistoriaPorId);
router.put('/:id', authenticate,permitirRoles(['Admin', 'Veterinario']),auditar('HISTORIACLI_ACTUALIZAR'), historia.actualizarHistoria);
router.delete('/:id', authenticate,permitirRoles(['Admin']),auditar('HISTORIACLI_ELIMINAR'),historia.eliminarHistoria);

module.exports = router;
