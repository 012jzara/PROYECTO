console.log("Ruta actual:", __dirname);
const express = require('express');
const router = express.Router();
const { registrarLog, obtenerLogs } = require('../controllers/logController');

router.post('/', registrarLog);
router.get('/', obtenerLogs);

module.exports = router;
