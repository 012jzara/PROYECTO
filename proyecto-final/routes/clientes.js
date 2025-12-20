const express = require('express');
const router = express.Router();
const cliente = require('../controllers/clienteController');
const { authenticate, permitirRoles, auditar } = require('../middleware/authMiddleware');

const ROLES = ['Admin', 'Veterinario', 'Caja', 'Asistente'];

router.get('/buscar/:texto', authenticate,permitirRoles(ROLES), auditar('CLIENTE_BUSCAR'),cliente.buscarCliente);
router.get('/existe/dni/:dni',authenticate,permitirRoles(ROLES),auditar('CLIENTE_EXISTE_DNI'),cliente.existeClientePorDni);
router.post('/',authenticate,permitirRoles(ROLES),auditar('CLIENTE_CREAR'),cliente.agregarCliente);
router.get('/',authenticate,permitirRoles(ROLES),auditar('CLIENTE_LISTAR'), cliente.obtenerCliente);
router.get('/:id',authenticate,permitirRoles(ROLES),auditar('CLIENTE_POR_ID'),cliente.obtenerClientePorId);
router.put('/:id',authenticate,permitirRoles(ROLES),auditar('CLIENTE_ACTUALIZAR'), cliente.actualizarCliente);
router.delete('/:id',authenticate,permitirRoles(['Admin']),auditar('CLIENTE_ELIMINAR'), cliente.eliminarCliente);

module.exports = router;
