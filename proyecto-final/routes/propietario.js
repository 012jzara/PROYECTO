const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/propietarioController');

router.get('/', ctrl.obtenerPropietarios);
router.get('/:id', ctrl.obtenerPropietario);
router.post('/', ctrl.crearPropietario);
router.put('/:id', ctrl.actualizarPropietario);
router.delete('/:id', ctrl.eliminarPropietario);

module.exports = router;