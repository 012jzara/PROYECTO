const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { crearCita,
    obtenerCitas,
    eliminarCita,
    actualizarCita,
    historialpacienteCita,
    actualizarEstadoCita, 
    obtenerCitasPorMes} = citaController;


router.post('/', crearCita);
router.get('/', obtenerCitas);
router.delete('/:id', eliminarCita);
router.put('/:id', actualizarCita);
router.put('/estado/:id', actualizarEstadoCita);
router.get('/historial', citaController.obtenerHistorialGeneral);
router.get('/historial-paciente/:nombre', historialpacienteCita);
router.get('/citas-por-mes', citaController.obtenerCitasPorMes);

module.exports = router;
