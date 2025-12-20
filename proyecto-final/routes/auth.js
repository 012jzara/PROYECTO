const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const usuario = require('../controllers/usuarioController');
const { authenticate, permitirRoles, auditar } = require('../middleware/authMiddleware');

const ROLES = {
  ADMIN: 'Admin',
  VET: 'Veterinario',
  CAJA: 'Caja',
  INV: 'Inventario',
  ASIST: 'Asistente',
  USER: 'User'
};

router.post('/login', auditar('Auth - Login'),auth.login);
router.post('/refresh', auditar('Auth - Refresh Token'),auth.refresh);
router.post('/logout',auditar('Auth - Logout'), auth.logout);

module.exports = router;
