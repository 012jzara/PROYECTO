const express = require('express');
const router = express.Router();
const usuario = require('../controllers/usuarioController');
const { authenticate, permitirRoles, auditar } = require('../middlewares/authMiddleware');

const ROLES = { ADMIN: 'Admin'};

router.post('/register', authenticate, permitirRoles([ROLES.ADMIN]), auditar(['USUARIO_CREAR']), usuario.registrarUsuario);
router.get('/', auth, authenticate, permitirRoles([ROLES.ADMIN]),auditar(['USUARIO_LISTAR']), usuario.obtenerUsuarios);
router.get('/me', authenticate,permitirRoles([ROLES.ADMIN]), auditar('USUARIO_ME'),usuario.obtenerPerfil);
router.get('/:id',authenticate,permitirRoles([ROLES.ADMIN]),auditar('USUARIO_OBTENER_POR_ID'),usuario.obtenerUsuarioPorId);
router.put('/:id',authenticate,permitirRoles([ROLES.ADMIN]),auditar('USUARIO_ACTUALIZAR'),usuario.actualizarUsuario);
router.put('/:id/rol',  authenticate, permitirRoles([ROLES.ADMIN]), auditar(['USUARIO_CAMBIAR_ROL']),usuario.actualizarRol);
router.put('/:id/activar',  authenticate, permitirRoles([ROLES.ADMIN]), auditar(['USUARIO_ACTIVAR']), usuario.activarUsuario);
router.put('/:id/desactivar',  authenticate, permitirRoles([ROLES.ADMIN]), auditar(['USUARIO_DESACTIVAR']), usuario.desactivarUsuario);
router.put('/:id/password',  authenticate, auditar(['USUARIO_CAMBIAR_PASSWORD']), usuario.cambiarPassword);

module.exports = router;
