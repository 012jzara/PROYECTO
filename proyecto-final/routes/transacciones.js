const express = require('express');
const router = express.Router();
const transaccion = require('../controllers/transaccionController');
const { authenticate, permitirRoles, auditar } = require('../middlewares/authMiddleware');

const ROLES = ['Admin', 'Caja'];

router.get('/filtro/tipo/:tipo', authenticate,
  permitirRoles(ROLES),
  auditar('TRANSACCION_FILTRO_TIPO'), transaccion.obtenerPorTipo);
router.get('/filtro/metodo/:metodo', authenticate,
  permitirRoles(ROLES),
  auditar('TRANSACCION_FILTRO_TIPO'), transaccion.obtenerPorMetodoPago);
router.get('/filtro/subtipo/:subtipo', authenticate,
  permitirRoles(ROLES),
  auditar('TRANSACCION_FILTRO_TIPO'), transaccion.obtenerPorSubtipo);
router.get('/filtro/fecha/:inicio/:fin', authenticate,
  permitirRoles(ROLES),
  auditar('TRANSACCION_FILTRO_TIPO'), transaccion.obtenerPorRangoFechas);
router.get('/reportes/totales', authenticate,
  permitirRoles(ROLES),
  auditar('TRANSACCION_FILTRO_TIPO'), transaccion.obtenerTotales);
router.get('/reportes/totales-mensuales/:año/:mes',  authenticate,
  permitirRoles(ROLES),
  auditar('TRANSACCION_FILTRO_TIPO'),transaccion.totalesMensuales);
router.get('/reportes/categoria/:categoria', authenticate,
  permitirRoles(ROLES),
  auditar('TRANSACCION_FILTRO_TIPO'), transaccion.reportePorCategoria);
router.get('/', authenticate,permitirRoles(ROLES),auditar('TRANSACCION_LISTAR'),transaccion.obtenerTransacciones);
router.get('/:id',authenticate,permitirRoles(ROLES),auditar('TRANSACCION_OBTENER_POR_ID'), transaccion.obtenerTransaccionPorId);
router.post('/',authenticate,permitirRoles(['Admin']),auditar('TRANSACCION_CREAR'), transaccion.crearTransaccion);
router.put('/:id', authenticate,permitirRoles(['Admin']),auditar('TRANSACCION_ACTUALIZAR'),transaccion.actualizarTransaccion);
router.delete('/:id', authenticate,permitirRoles(['Admin']),auditar('TRANSACCION_ELIMINAR'),transaccion.eliminarTransaccion);


module.exports = router;
