const express = require('express');
const router = express.Router();
const proveedor= require('../controllers/proveedorController');
const { authenticate, permitirRoles, auditar } = require('../middleware/authMiddleware');

const ROLES_ADMIN_INV = ['Admin', 'Inventario'];

router.post('/',authenticate,permitirRoles(ROLES_ADMIN_INV),auditar('PROVEEDOR_CREAR'),proveedor.crearProveedor);
router.get('/',authenticate,permitirRoles(['Admin', 'Inventario', 'Caja']),auditar('PROVEEDOR_LISTAR'),proveedor.obtenerProveedores);
router.get('/buscar/:texto',authenticate,permitirRoles(ROLES_ADMIN_INV),auditar('PROVEEDOR_BUSCAR'),proveedor.buscarProveedor);
router.get('/:id',authenticate,permitirRoles(['Admin', 'Inventario', 'Caja']),auditar('PROVEEDOR_LISTAR_POR_ID'),proveedor.obtenerProveedorPorId);
router.put('/:id',authenticate,permitirRoles(['Admin', 'Inventario']),auditar('PROVEEDOR_ACTUALIZAR'),proveedor.actualizarProveedor);
router.put('/:id/activar',authenticate,permitirRoles(ROLES_ADMIN_INV),auditar('PROVEEDOR_ACTIVAR'),proveedor.activarProveedor);
router.put('/:id/desactivar',authenticate,permitirRoles(['Admin']),auditar('PROVEEDOR_DESACTIVAR'),proveedor.desactivarProveedor);
router.delete('/:id',authenticate,permitirRoles(['Admin']),auditar('PROVEEDOR_ELIMINAR'),proveedor.eliminarProveedor);

module.exports = router;
