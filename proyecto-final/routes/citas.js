const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { crearCita,
    obtenerCitas,
    eliminarCita,
    actualizarCita,
    historialpacienteCita,
    actualizarEstadoCita,
    obtenerHistorialGeneral,
    obtenerCitasPorMes,
  obtenerCitasPorMesFlexible,
    obtenerCitasPorRangoFechas,
  verificarConflictoCita} = citaController;


router.post('/', crearCita);
router.get('/', obtenerCitas);
router.delete('/:id', eliminarCita);
router.put('/:id', actualizarCita);
router.put('/estado/:id', actualizarEstadoCita);
router.get('/historial', citaController.obtenerHistorialGeneral);
router.get('/historial-paciente/:nombre', historialpacienteCita);
router.get('/citas-por-mes', citaController.obtenerCitasPorMes);
router.get('/rango-fechas', citaController.obtenerCitasPorRangoFechas);
router.get('/conflicto', verificarConflictoCita);
router.get('/citas-por-mes', obtenerCitasPorMes); // solo por mes
router.get('/citas-por-mes-flexible', obtenerCitasPorMesFlexible); // con agrupaciones dinámicas



module.exports = router;
