const express = require('express');
const router = express.Router();
const reportesInventario = require('../controllers/reportesInventarioController');
const { authenticate, permitirRoles} = require('../middlewares/authMiddleware');

router.get(
  '/lotes-por-vencer',
  authenticate,
  permitirRoles(['Admin', 'Inventario']),
  reportesInventario.obtenerLotesPorVencer
);

module.exports = router;
