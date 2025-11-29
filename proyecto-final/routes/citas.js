const express = require('express');
const router = express.Router();

const { 
  crearCita,
  obtenerCitas,
  eliminarCita,
  actualizarCita,
  historialpacienteCita,
  actualizarEstadoCita,
  obtenerHistorialGeneral,
  obtenerCitasPorMes,
  obtenerCitasPorRangoFechas,
  verificarConflictoCita
} = require('../controllers/citaController');

router.post('/', crearCita);
router.get('/', obtenerCitas);
router.get('historial' , obtenerHistorialGeneral);
router.get('/historial-pacientr/:nombre' ,  historialpacienteCita);
router.get('/cita-por-mes' , obtenerCitasPorMes);
router.get('/rango-fechas' , obtenerCitasPorRangoFechas);
router.get('/conflicto' , verificarConflictoCita);
router.put('/estado/:id' , actualizarEstadoCita);
router.put('/:id' , actualizarCita);
router.delete('/:id', eliminarCita);

module.exports = router;
