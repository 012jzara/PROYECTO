const express = require('express');
const router = express.Router();
const { obtenerHistorialPorCita } = require('../controllers/HistorialCitaController');

router.get('/:citaId', obtenerHistorialPorCita);

module.exports = router;
