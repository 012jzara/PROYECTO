const express = require('express');
const router = express.Router();
const horario = require('../controllers/horarioVeterinarioController');
const { authenticate, permitirRoles, auditar } = require('../middleware/authMiddleware');

router.post('/', authenticate,permitirRoles(['Admin', 'Veterinario']),auditar('HORARIO_CREAR'), horario.crearHorario);
router.get('/', authenticate,permitirRoles(['Admin', 'Veterinario', 'Asistente']),auditar('HORARIO_LISTAR'),horario.obtenerHorarios);
router.get('/veterinario/:id', authenticate,permitirRoles(['Admin', 'Veterinario', 'Asistente']), auditar('HORARIO_POR_VETERINARIO'), horario.obtenerHorariosPorVeterinario);
router.get('/:id', authenticate,permitirRoles(['Admin', 'Veterinario']), auditar('HORARIO_POR_ID'), horario.obtenerHorarioPorId);
router.put('/:id', authenticate, permitirRoles(['Admin', 'Veterinario']), auditar('HORARIO_ACTUALIZAR'), horario.actualizarHorario);
router.delete('/:id', authenticate,permitirRoles(['Admin']),auditar('HORARIO_ELIMINAR'), horario.eliminarHorario);

module.exports = router;
