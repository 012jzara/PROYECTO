const express = require('express');
const router = express.Router();
const cita = require('../controllers/citaController');
const { authenticate, permitirRoles, auditar } = require('../middleware/authMiddleware');

const ROLES_WRITE = ['Admin', 'Veterinario', 'Asistente', 'Caja'];
const ROLES_READ  = ['Admin', 'Veterinario', 'Asistente', 'Caja'];

router.post('/',authenticate,permitirRoles(ROLES_WRITE),auditar('CITA_CREAR'),cita.crearCita);
router.get('/historial/general',authenticate,permitirRoles(['Admin']),auditar('CITA_HISTORIAL_GENERAL'),cita.obtenerHistorialGeneral);
router.get('/historial/paciente/:pacienteId',authenticate,permitirRoles(['Admin', 'Veterinario']),auditar('CITA_HISTORIAL_PACIENTE'),cita.historialpaciente);
router.get('/rango',authenticate,permitirRoles(ROLES_READ),auditar('CITA_POR_RANGO'),cita.obtenerCitasPorRangoFechas);
router.get('/estadisticas/por-mes',authenticate,permitirRoles(['Admin']),auditar('CITA_ESTADISTICA_POR_MES'),cita.obtenerCitasPorMes);
router.get('/verificar-conflicto',authenticate,permitirRoles(ROLES_WRITE),auditar('CITA_VERIFICAR_CONFLICTO'),cita.verificarConflictoCita);
router.get('/',authenticate,permitirRoles(ROLES_READ),auditar('CITA_LISTAR'),cita.obtenerCitas);
router.get('/:id',authenticate,permitirRoles(ROLES_READ),auditar('CITA_OBTENER_POR_ID'),cita.obtenerCitaPorId);
router.put('/:id',authenticate,permitirRoles(ROLES_WRITE),auditar('CITA_ACTUALIZAR'),cita.actualizarCita);
router.patch('/:id/estado',authenticate,permitirRoles(ROLES_WRITE),auditar('CITA_ACTUALIZAR_ESTADO'),cita.actualizarEstadoCita);
router.delete('/:id',authenticate,permitirRoles(['Admin']),auditar('CITA_ELIMINAR'),cita.eliminarCita);