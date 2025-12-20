const express = require('express');
const router = express.Router();
const log = require('../controllers/LogController');
const { authenticate, permitirRoles} = require('../middlewares/authMiddleware');

router.post('/', authenticate, log.registrarLog);
router.get('/', authenticate, permitirRoles(['Admin']), log.obtenerLogs);
router.get('/usuario/:usuario', authenticate, permitirRoles(['Admin']),log.obtenerLogsPorUsuario);
router.get('/accion/:accion', authenticate, permitirRoles(['Admin']),log.obtenerLogsPorAccion);
router.get('/rango-fechas', authenticate, permitirRoles(['Admin']),log.ObtenerLogsPorRangoFechas);

module.exports = router;
