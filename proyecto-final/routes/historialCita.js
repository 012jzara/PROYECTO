const express = require('express');
const router = express.Router();
const { obtenerHistorialPorCita } = require('../controllers/historialCitaController');

router.get('/:citaId', obtenerHistorialPorCita);

module.exports = router;
