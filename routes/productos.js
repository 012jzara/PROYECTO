const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productoController');

router.get('/', ctrl.obtenerProductos);
router.post('/', ctrl.agregarProducto);
router.put('/:id', ctrl.actualizarProducto);
router.delete('/:id', ctrl.eliminarProducto);
router.get('/buscar/:filtro', ctrl.buscarProducto);
router.put('/movimiento/:id', ctrl.movimientoProducto);

module.exports = router;
