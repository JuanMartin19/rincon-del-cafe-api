const express = require('express');
const router = express.Router();
const { obtenerMetricas } = require('../controllers/reportes.controller');

router.get('/', obtenerMetricas);

module.exports = router;