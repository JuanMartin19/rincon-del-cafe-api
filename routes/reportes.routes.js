const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth.middleware');
const { obtenerMetricas } = require('../controllers/reportes.controller');

router.get('/', verificarToken, obtenerMetricas);

module.exports = router;