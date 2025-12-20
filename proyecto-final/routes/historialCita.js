const express = require('express');
const router = express.Router();
const historialCita = require('../controllers/HistorialCitaController');
const { authenticate, permitirRoles, auditar } = require('../middlewares/authMiddleware');

router.post('/',authenticate, permitirRoles(['Admin', 'Veterinario' ]), auditar('HISTORIALCITA_CREAR'), historialCita.crearHistorial);
router.get('/',authenticate, permitirRoles(['Admin', 'Veterinario']), auditar('HISTORIALCITA_LISTAR'),  historialCita.obtenerHistorial);
router.get('/cita/:citaId',authenticate, permitirRoles(['Admin', 'Veterinario']), auditar('HISTORIALCITA_POR_CITA'),historialCita.obtenerHistorialPorCita);
router.get('/rango-fechas',authenticate, permitirRoles(['Admin', 'Veterinario']), auditar('HISTORIALCITA_LISTA_POR_RANGO'), historialCita.obtenerPorRangoFechas);
router.delete('/:id', authenticate, permitirRoles(['Admin']), auditar('HISTORIALCITA_ELIMINAR'),historialCita.eliminarHistorial);
router.delete('/cita/:citaId',authenticate, permitirRoles(['Admin']), auditar('HISTORIALCITA_ELIMINAR_POR_CITA'),historialCita.eliminarHistorialDeCita);

module.exports = router;