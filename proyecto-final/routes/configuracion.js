const express = require('express');
const router = express.Router();
const config = require('../controllers/configuracionController');
const { authenticate, permitirRoles, auditar } = require('../middleware/authMiddleware');

router.post('/', authenticate, permitirRoles (['Admin']),auditar('CONFIG_CREAR'), config.crearConfig);
router.get('/', authenticate, permitirRoles(['Admin']), auditar('CONFIG_LISTAR'),config.obtenerConfigs);
router.get('/:clave', authenticate, permitirRoles(['Admin']), auditar('CONFIG_OBTENER_POR_CLAVE'),config.obtenerConfigPorClave);
router.put('/:clave', authenticate, permitirRoles(['Admin']), auditar('CONFIG_ACTUALIZAR'), config.actualizarConfig);
router.delete('/:clave', authenticate, permitirRoles(['Admin']), auditar('CONFIG_ELIMINAR'),config.eliminarConfig);

module.exports = router;
