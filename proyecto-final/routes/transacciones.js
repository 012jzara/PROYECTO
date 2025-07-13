const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/transaccionController');

router.get('/', ctrl.obtenerTransacciones);
router.get('/:id', ctrl.obtenerTransaccionPorId);
router.post('/', ctrl.crearTransaccion);
router.put('/:id', ctrl.actualizarTransaccion);
router.delete('/:id', ctrl.eliminarTransaccion);

module.exports = router;