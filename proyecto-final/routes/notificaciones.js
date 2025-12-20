const express = require('express');
const router = express.Router();
const notifica = require('../controllers/notificacionController');
const { authenticate, permitirRoles } = require('../middleware/authMiddleware');

router.post('/',authenticate,permitirRoles(['Admin']),notifica.crearNotificacion);
router.get('/',authenticate,permitirRoles(['Admin']),notifica.obtenerNotificaciones);
router.get('/mis',authenticate,notifica.obtenerMisNotificaciones);
router.get('/mis/no-leidas/contador',authenticate,notifica.contarNoLeidas);
router.put('/:id/leida',authenticate,notifica.marcarComoLeida);
router.put('/mis/marcar-todas-leidas',authenticate,notifica.marcarTodasComoLeidas);
router.delete('/:id',authenticate,permitirRoles(['Admin']),notifica.eliminarNotificacion);

module.exports = router;
