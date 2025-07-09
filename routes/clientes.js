const express = require('express');
const router = express.Router();
const clienteCtrl = require('../controllers/clienteController');

router.get('/buscar/:texto', clienteCtrl.buscarCliente);
router.post('/', clienteCtrl.agregarCliente);

module.exports = router;
