const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/usuarios', require('./usuarios.routes'));

router.use('/clientes', require('./clientes.routes'));
router.use('/mascotas', require('./mascotas.routes'));
router.use('/historias', require('./historias.routes'));
router.use('/citas', require('./citas.routes'));
router.use('/horarios', require('./horarios.routes'));
router.use('/servicios', require('./servicios.routes'));

router.use('/productos', require('./productos.routes'));
router.use('/movimientos', require('./movimientos.routes'));
router.use('/compras', require('./compras.routes'));
router.use('/ventas', require('./ventas.routes'));

router.use('/pagos', require('./pagos.routes'));
router.use('/transacciones', require('./transacciones.routes'));

router.use('/config', require('./config.routes'));

 router.use('/proveedores', require('./proveedores.routes'));
 router.use('/notificaciones', require('./notificaciones.routes'));

module.exports = router;
